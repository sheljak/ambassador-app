import React, { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { FormInput, Button, Select, TagSelect } from '@/components/ui';
import type { SelectItem } from '@/components/ui';
import { Loader } from '@/components/Loader';
import { useTheme } from '@/theme';
import {
  useGetAmbassadorDataQuery,
  useGetAccountQuery,
  useGetProfileTypesQuery,
  useGetStudentTypesQuery,
  useGetStaffTypesQuery,
  useGetSubjectsQuery,
  useGetYearOfStudyQuery,
  useGetIndustriesQuery,
  useGetCourseTypesQuery,
  useGetCountriesQuery,
  useGetInterestsQuery,
  useSetProfileInfoMutation,
} from '@/store/features/auth/api';
import { ToastService } from '@/services';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProfileFormData {
  describe: string;
  introduction: string;
  job_title: string;
  job_role: string;
  company_region: string;
}

interface ChildEntry {
  age: string;
  studying_year: number | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tagsToSelectItems(tags: unknown, useNameAsId = false): SelectItem[] {
  if (!Array.isArray(tags)) return [];
  return tags.map((t: any) => ({
    id: useNameAsId ? (t.name ?? t.key ?? t.id) : (t.id ?? t.key ?? t.name),
    name: t.name ?? t.key ?? '',
    key: t.key,
  }));
}

/** Unwrap API response data — handles various shapes like { tags: [] }, { answers: [] }, { profileTypes: [] }, etc. */
function unwrapArray(data: unknown): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  const d = data as any;
  // Try common wrapper keys
  for (const key of Object.keys(d)) {
    if (Array.isArray(d[key])) return d[key];
  }
  return [];
}

/** Items keyed by `key` field (for profileTypes, staffTypes) */
function extractTagsByKey(data: unknown): SelectItem[] {
  const arr = unwrapArray(data);
  return arr.map((t: any) => ({
    id: t.key ?? t.id ?? t.name,
    name: t.name ?? t.key ?? '',
    key: t.key,
    _originalId: t.id, // keep numeric id for submission
  }));
}

function extractTags(data: unknown, useNameAsId = false): SelectItem[] {
  const arr = unwrapArray(data);
  return tagsToSelectItems(arr, useNameAsId);
}

const YEARS_OF_STUDYING: SelectItem[] = Array.from({ length: 13 }, (_, i) => ({
  id: i + 1,
  name: `Year ${i + 1}`,
}));

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AmbassadorProfileScreen() {
  const { colors, palette, spacing, shapes } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Data queries
  const { data: ambassadorResponse, isLoading: isLoadingProfile } = useGetAmbassadorDataQuery();
  const ambassadorData = (ambassadorResponse?.data as any)?.ambassadorData ?? (ambassadorResponse?.data as any);
  const userTags = ambassadorData?.user_tags;

  const { data: accountResponse } = useGetAccountQuery();
  const account = (accountResponse?.data as any)?.account ?? accountResponse?.data;

  const { data: profileTypesRes } = useGetProfileTypesQuery();
  const { data: studentTypesRes } = useGetStudentTypesQuery();
  const { data: staffTypesRes } = useGetStaffTypesQuery();
  const { data: subjectsRes } = useGetSubjectsQuery();
  const { data: yearOfStudyRes } = useGetYearOfStudyQuery();
  const { data: industriesRes } = useGetIndustriesQuery();
  const { data: courseTypesRes } = useGetCourseTypesQuery();
  const { data: countriesRes } = useGetCountriesQuery();
  const { data: interestsRes } = useGetInterestsQuery();

  const [setProfileInfo, { isLoading: isSaving }] = useSetProfileInfoMutation();

  // Dropdown items
  // profileTypes & staffTypes use `key` as unique identifier (like old app)
  const profileTypes = useMemo(() => extractTagsByKey(profileTypesRes?.data), [profileTypesRes]);
  const studentTypes = useMemo(() => extractTags(studentTypesRes?.data), [studentTypesRes]);
  const staffTypes = useMemo(() => extractTagsByKey(staffTypesRes?.data), [staffTypesRes]);
  const subjects = useMemo(() => {
    const list = extractTags(subjectsRes?.data, true);
    // Inject current user subject if not in API list (custom subject)
    const currentSubjectName = userTags?.subject?.[0]?.name;
    if (currentSubjectName && !list.find((s) => s.name === currentSubjectName)) {
      list.unshift({ id: currentSubjectName, name: currentSubjectName });
    }
    return list;
  }, [subjectsRes, userTags?.subject]);
  const yearsOfStudy = useMemo(() => {
    const list = extractTags(yearOfStudyRes?.data);
    list.sort((a, b) => Number(a.id) - Number(b.id));
    return list;
  }, [yearOfStudyRes]);
  const industries = useMemo(() => {
    const list = extractTags(industriesRes?.data, true);
    // Inject current user industry if not in API list (custom industry)
    const currentIndustryName = userTags?.industry?.[0]?.name;
    if (currentIndustryName && !list.find((i) => i.name === currentIndustryName)) {
      list.unshift({ id: currentIndustryName, name: currentIndustryName });
    }
    return list;
  }, [industriesRes, userTags?.industry]);
  const courseTypes = useMemo(() => {
    const list = extractTags(courseTypesRes?.data);
    const currentCourseType = userTags?.courses_types?.[0];
    if (currentCourseType?.name && !list.find((c) => String(c.id) === String(currentCourseType.id) || c.name === currentCourseType.name)) {
      list.unshift({ id: currentCourseType.id ?? currentCourseType.name, name: currentCourseType.name });
    }
    return list;
  }, [courseTypesRes, userTags?.courses_types]);
  const interestItems = useMemo(() => {
    const list = extractTags(interestsRes?.data);
    // Inject user's current interests if not in API list (legacy custom interests)
    const currentInterests = userTags?.interests ?? [];
    for (const interest of currentInterests) {
      if (interest.name && !list.find((i) => String(i.id) === String(interest.id) || i.name === interest.name)) {
        list.push({ id: interest.id ?? interest.name, name: interest.name });
      }
    }
    return list;
  }, [interestsRes, userTags?.interests]);
  const countries = useMemo(() => {
    return tagsToSelectItems(unwrapArray(countriesRes?.data), true);
  }, [countriesRes]);

  // Determine institution type
  const isEmployee = account?.university?.institutionType?.key === 'recruitment';

  // State for select fields
  const [profileType, setProfileType] = useState<string>('');
  const [profileTypeId, setProfileTypeId] = useState<number | string | null>(null);
  const [staffTypeId, setStaffTypeId] = useState<string | null>(null);
  const [studentTypeId, setStudentTypeId] = useState<number | string | null>(null);
  const [yearOfStudyId, setYearOfStudyId] = useState<number | string | null>(null);
  const [subjectValue, setSubjectValue] = useState<string | null>(null);
  const [courseTypeId, setCourseTypeId] = useState<number | string | null>(null);
  const [industryValue, setIndustryValue] = useState<string | null>(null);
  const [companyCountryName, setCompanyCountryName] = useState<string | null>(null);
  const [workingSince, setWorkingSince] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [children, setChildren] = useState<ChildEntry[]>([{ age: '', studying_year: null }]);
  const [childDatePickerIndex, setChildDatePickerIndex] = useState<number | null>(null);
  const [tempChildDate, setTempChildDate] = useState<Date>(new Date());
  const [tempWorkingSinceDate, setTempWorkingSinceDate] = useState<Date>(new Date());
  const [selectedInterestIds, setSelectedInterestIds] = useState<(number | string)[]>([]);

  // Populate state once ambassador data + dropdown data have loaded
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (hasInitialized.current) return;
    if (!ambassadorData) return;
    // Wait until at least profileTypes are loaded so we can resolve the correct IDs
    if (profileTypes.length === 0) return;
    hasInitialized.current = true;

    const tags = ambassadorData.user_tags ?? {};
    const acct = account ?? ambassadorData;

    // Resolve profile type key and find matching quiz answer
    const currentKey = isEmployee ? 'employee' : (tags.profile?.[0]?.key ?? '');
    setProfileType(currentKey);
    // profileTypes items have id=key, but we need _originalId for the API
    const matchedProfileType = profileTypes.find((p) => p.id === currentKey);
    setProfileTypeId((matchedProfileType as any)?._originalId ?? matchedProfileType?.id ?? null);

    // Staff type — find matching item by key or name
    if (tags.staff?.[0]) {
      const tagKey = tags.staff[0].key;
      const tagName = tags.staff[0].name;
      const matched = staffTypes.find(
        (s) => s.id === tagKey || s.name === tagName
      );
      setStaffTypeId(matched ? String(matched.id) : tagKey);
    }

    // Student type — find matching item
    if (tags.student?.[0]) {
      const tagId = tags.student[0].id;
      const tagKey = tags.student[0].key;
      const matched = studentTypes.find(
        (s) => String(s.id) === String(tagId) || String((s as any).key) === String(tagKey)
      );
      setStudentTypeId(matched?.id ?? tagId ?? null);
    }

    // Year of study — find matching item
    if (tags.year_of_study?.[0]) {
      const tagId = tags.year_of_study[0].id;
      const tagKey = tags.year_of_study[0].key;
      const matched = yearsOfStudy.find(
        (y) => String(y.id) === String(tagId) || String((y as any).key) === String(tagKey)
      );
      setYearOfStudyId(matched?.id ?? tagId ?? null);
    }

    // Subject — stored by name
    setSubjectValue(tags.subject?.[0]?.name ?? null);

    // Course type — match by id
    if (tags.courses_types?.[0]) {
      setCourseTypeId(tags.courses_types[0].id ?? null);
    }

    // Industry — stored by name
    setIndustryValue(tags.industry?.[0]?.name ?? null);

    // Employee-specific
    setCompanyCountryName(acct?.additionalData?.company_country_name ?? null);
    setWorkingSince(acct?.additionalData?.working_since ?? '');

    // Children
    const accountChildren = acct?.children;
    if (Array.isArray(accountChildren) && accountChildren.length > 0) {
      setChildren(
        accountChildren.map((c: any) => ({
          age: c.age ? new Date(c.age).toISOString().slice(0, 10) : '',
          studying_year: c.studying_year ?? null,
        }))
      );
    }

    // Interests — select IDs matching user's current interests
    const currentInterests = tags.interests ?? [];
    const matchedIds = currentInterests.map((interest: any) => {
      const matched = interestItems.find(
        (i) => String(i.id) === String(interest.id) || i.name === interest.name
      );
      return matched?.id ?? interest.id ?? interest.name;
    }).filter(Boolean);
    setSelectedInterestIds(matchedIds);
  }, [ambassadorData, account, isEmployee, profileTypes, staffTypes, studentTypes, yearsOfStudy, interestItems]);

  // Form — `values` prop syncs when data loads
  const acctOrAmbassador = account ?? ambassadorData;
  const { control, handleSubmit } = useForm<ProfileFormData>({
    values: {
      describe: acctOrAmbassador?.description ?? '',
      introduction:
        acctOrAmbassador?.introduction ??
        "Hey! Please write your questions below, and I'll get back to you as soon as I can. Look forward to chatting!",
      job_title: userTags?.job_title?.[0]?.name ?? '',
      job_role: userTags?.job_role?.[0]?.name ?? '',
      company_region: acctOrAmbassador?.additionalData?.company_region ?? '',
    },
  });

  // Handlers
  const handleProfileTypeSelect = useCallback(
    (item: SelectItem) => {
      setProfileType(String(item.id)); // id = key for profileTypes
      setProfileTypeId((item as any)._originalId ?? item.id);
    },
    []
  );

  const isAcademicStaff = staffTypeId === 'academic' || staffTypeId === '_staff_Academic';

  const requiresInterests =
    profileType === 'student' ||
    profileType === 'school_student' ||
    profileType === 'alumni' ||
    profileType === 'employee';

  // Children handlers
  const addChild = useCallback(() => {
    setChildren((prev) => {
      if (prev.length >= 4) return prev;
      return [...prev, { age: '', studying_year: null }];
    });
  }, []);

  const removeChild = useCallback((index: number) => {
    setChildren((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleChildDateChange = useCallback(
    (event: any, date?: Date) => {
      if (Platform.OS === 'android') {
        setChildDatePickerIndex(null);
        if (event.type === 'dismissed' || !date || childDatePickerIndex === null) return;
        const formatted = date.toISOString().slice(0, 10);
        setChildren((prev) => {
          const next = [...prev];
          next[childDatePickerIndex] = { ...next[childDatePickerIndex], age: formatted };
          return next;
        });
      } else if (date) {
        setTempChildDate(date);
      }
    },
    [childDatePickerIndex]
  );

  const handleChildDateDone = useCallback(() => {
    if (childDatePickerIndex === null) return;
    const formatted = tempChildDate.toISOString().slice(0, 10);
    setChildren((prev) => {
      const next = [...prev];
      next[childDatePickerIndex] = { ...next[childDatePickerIndex], age: formatted };
      return next;
    });
    setChildDatePickerIndex(null);
  }, [childDatePickerIndex, tempChildDate]);

  const handleChildYearSelect = useCallback((index: number, item: SelectItem) => {
    setChildren((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], studying_year: Number(item.id) };
      return next;
    });
  }, []);

  // Working since date handler
  const handleWorkingSinceDateChange = useCallback(
    (event: any, date?: Date) => {
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
        if (event.type === 'dismissed' || !date) return;
        setWorkingSince(date.toISOString().slice(0, 10));
      } else if (date) {
        setTempWorkingSinceDate(date);
      }
    },
    []
  );

  const handleWorkingSinceDateDone = useCallback(() => {
    setWorkingSince(tempWorkingSinceDate.toISOString().slice(0, 10));
    setShowDatePicker(false);
  }, [tempWorkingSinceDate]);

  // Submit
  const onSubmit = useCallback(
    async (values: ProfileFormData) => {
      // Resolve selected interest names for the API
      const interests = selectedInterestIds
        .map((id) => {
          const item = interestItems.find((i) => i.id === id);
          return item?.name ?? '';
        })
        .filter(Boolean);

      // For profileTypes/staffTypes, id=key, so look up _originalId for API
      const selectedStaffType = staffTypes.find(
        (s) => String(s.id) === staffTypeId
      );
      const selectedStudentType = studentTypes.find(
        (s) => String(s.id) === String(studentTypeId)
      );
      const selectedYearOfStudy = yearsOfStudy.find(
        (y) => String(y.id) === String(yearOfStudyId)
      );
      const countriesRaw = (() => {
        const d = countriesRes?.data as any;
        return Array.isArray(d) ? d : d?.countries ?? [];
      })();
      const selectedCountry = countriesRaw.find(
        (c: any) => c.name === companyCountryName
      );

      const data: Record<string, unknown> = {
        profile_type_id: profileTypeId,
        description: values.describe,
        introduction: values.introduction,
        country: userTags?.countries?.[0]?.id ?? null,
        region: acctOrAmbassador?.region,
      };

      switch (profileType) {
        case 'staff':
          data.staff_type_id = (selectedStaffType as any)?._originalId ?? selectedStaffType?.id;
          data.subject = isAcademicStaff ? subjectValue : null;
          data.job_title = !isAcademicStaff ? values.job_title : null;
          data.interests = interests;
          break;
        case 'student':
          data.student_type_id = selectedStudentType?.id;
          data.year_of_study_id = selectedYearOfStudy?.id;
          data.subject = subjectValue;
          data.course_type_id = courseTypeId;
          data.interests = interests;
          break;
        case 'alumni':
          data.job_role = values.job_role;
          data.industry = industryValue;
          data.interests = interests;
          break;
        case 'parent':
          data.children = children;
          break;
        case 'school_student':
          data.interests = interests;
          break;
        case 'employee':
          data.job_role = values.job_role;
          data.working_since = workingSince;
          data.company_country_id = selectedCountry?.id;
          data.company_region = values.company_region;
          data.interests = interests;
          break;
      }

      try {
        await setProfileInfo(data as any).unwrap();
        ToastService.success('Changes saved');
      } catch (error) {
        console.error('Failed to save profile:', error);
        ToastService.error('Failed to save changes');
      }
    },
    [
      profileType, profileTypeId, staffTypes, staffTypeId,
      studentTypes, studentTypeId, yearsOfStudy, yearOfStudyId,
      industryValue, courseTypeId, countriesRes, companyCountryName,
      subjectValue, isAcademicStaff, children, workingSince, userTags, acctOrAmbassador,
      selectedInterestIds, interestItems, setProfileInfo,
    ]
  );

  // Loading state
  if (isLoadingProfile && !ambassadorData) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={palette.primary[500]} />
          </Pressable>
          <ThemedText style={styles.headerTitle}>Ambassador Profile</ThemedText>
          <View style={styles.headerSpacer} />
        </View>
        <Loader />
      </ThemedView>
    );
  }

  // ---------------------------------------------------------------------------
  // Render type-specific fields
  // ---------------------------------------------------------------------------

  const renderStaffFields = () => (
    <>
      <Select
        label="Staff member type"
        placeholder="Select staff member type"
        searchPlaceholder="Search..."
        items={staffTypes}
        value={staffTypeId}
        onSelect={(item) => setStaffTypeId(String((item as any).key ?? item.id))}
      />
      {isAcademicStaff ? (
        <Select
          label="Subject"
          placeholder="Select subject"
          searchPlaceholder="Search for a subject"
          items={subjects}
          value={subjectValue}
          onSelect={(item) => setSubjectValue(item.name)}
          allowCustom
        />
      ) : (
        <FormInput
          control={control}
          name="job_title"
          label="Job Title"
          placeholder="Enter your job title"
          maxLength={50}
          rules={{
            required: 'Enter your job title',
            minLength: { value: 3, message: 'Must be at least 3 characters' },
          }}
        />
      )}
    </>
  );

  const renderStudentFields = () => (
    <>
      <Select
        label="Type of Student"
        placeholder="Select student type"
        searchPlaceholder="Search..."
        items={studentTypes}
        value={studentTypeId}
        onSelect={(item) => setStudentTypeId(item.id)}
      />
      <Select
        label="Year of Study"
        placeholder="Select year of study"
        searchPlaceholder="Search..."
        items={yearsOfStudy}
        value={yearOfStudyId}
        onSelect={(item) => setYearOfStudyId(item.id)}
      />
      <Select
        label="Subject"
        placeholder="Select subject"
        searchPlaceholder="Search for a subject"
        items={subjects}
        value={subjectValue}
        onSelect={(item) => setSubjectValue(item.name)}
        allowCustom
      />
      <Select
        label="Course Type"
        placeholder="Select course type"
        searchPlaceholder="Search..."
        items={courseTypes}
        value={courseTypeId}
        onSelect={(item) => setCourseTypeId(item.id)}
        allowCustom
      />
    </>
  );

  const renderAlumniFields = () => (
    <>
      <Select
        label="Industry"
        placeholder="Select industry"
        searchPlaceholder="Search for an industry"
        items={industries}
        value={industryValue}
        onSelect={(item) => setIndustryValue(item.name)}
      />
      <FormInput
        control={control}
        name="job_role"
        label="Job Role"
        placeholder="Enter your job role"
        maxLength={50}
        rules={{
          required: 'Enter your job role',
          minLength: { value: 3, message: 'Must be at least 3 characters' },
        }}
      />
    </>
  );

  const renderParentFields = () => (
    <View style={styles.childrenSection}>
      <ThemedText style={[styles.sectionLabel, { color: colors.text.primary }]}>
        Children at {account?.university?.name}
      </ThemedText>
      {children.map((child, index) => {
        const ordinals = ['First', 'Second', 'Third', 'Fourth'];
        return (
          <View
            key={index}
            style={[
              styles.childCard,
              {
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.default,
                borderRadius: shapes.radius.md,
              },
            ]}
          >
            <View style={styles.childHeader}>
              <ThemedText style={[styles.childLabel, { color: colors.text.primary }]}>
                {ordinals[index]} child
              </ThemedText>
              {index > 0 && (
                <Pressable onPress={() => removeChild(index)}>
                  <Ionicons name="close" size={20} color={colors.text.secondary} />
                </Pressable>
              )}
            </View>

            <View style={styles.childField}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>
                Date of birth
              </Text>
              <Pressable
                onPress={() => {
                  setTempChildDate(children[index]?.age ? new Date(children[index].age) : new Date());
                  setChildDatePickerIndex(index);
                }}
                style={[
                  styles.dateButton,
                  {
                    borderColor: child.age ? colors.border.default : colors.status.error,
                    borderRadius: shapes.radius.md,
                    backgroundColor: colors.background.primary,
                  },
                ]}
              >
                <Text
                  style={{
                    color: child.age ? colors.text.primary : colors.text.secondary,
                    fontSize: 16,
                  }}
                >
                  {child.age || 'Choose date of birth'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={colors.text.secondary} />
              </Pressable>
              {!child.age && (
                <Text style={[styles.errorText, { color: colors.status.error }]}>
                  Choose date of birth
                </Text>
              )}
            </View>

            <Select
              label="Year of studying"
              placeholder="Choose year of studying"
              searchPlaceholder="Search..."
              items={YEARS_OF_STUDYING}
              value={child.studying_year}
              onSelect={(item) => handleChildYearSelect(index, item)}
              error={child.studying_year ? undefined : 'Choose year of studying'}
            />
          </View>
        );
      })}

      {children.length < 4 && (
        <Pressable onPress={addChild} style={styles.addButton}>
          <Text style={[styles.addButtonText, { color: palette.primary[500] }]}>
            Add a child
          </Text>
        </Pressable>
      )}
    </View>
  );

  const renderEmployeeFields = () => (
    <>
      <FormInput
        control={control}
        name="job_role"
        label="Job Role"
        placeholder="Enter your job role"
        maxLength={50}
        rules={{
          required: 'Enter your job role',
          minLength: { value: 3, message: 'Must be at least 3 characters' },
        }}
      />

      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>
          In this role since
        </Text>
        <Pressable
          onPress={() => {
            setTempWorkingSinceDate(workingSince ? new Date(workingSince) : new Date());
            setShowDatePicker(true);
          }}
          style={[
            styles.dateButton,
            {
              borderColor: colors.border.default,
              borderRadius: shapes.radius.md,
              backgroundColor: colors.background.secondary,
            },
          ]}
        >
          <Text
            style={{
              color: workingSince ? colors.text.primary : colors.text.secondary,
              fontSize: 16,
            }}
          >
            {workingSince || 'Choose date'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.text.secondary} />
        </Pressable>
      </View>

      <Select
        label="Company country"
        placeholder="Select a country"
        searchPlaceholder="Search for a country"
        items={countries}
        value={companyCountryName}
        onSelect={(item) => setCompanyCountryName(item.name)}
      />

      <FormInput
        control={control}
        name="company_region"
        label="Your job location (city/town)"
        placeholder="Enter your region"
        maxLength={50}
        rules={{
          required: 'Enter your region',
          minLength: { value: 3, message: 'Must be at least 3 characters' },
        }}
      />
    </>
  );

  const renderTypeFields = () => {
    switch (profileType) {
      case 'staff':
        return renderStaffFields();
      case 'student':
        return renderStudentFields();
      case 'alumni':
        return renderAlumniFields();
      case 'parent':
        return renderParentFields();
      case 'employee':
        return renderEmployeeFields();
      default:
        return null;
    }
  };

  const renderInterests = () => {
    if (profileType === 'parent') return null;

    const interestsError =
      requiresInterests && selectedInterestIds.length < 2
        ? 'Select at least 2 interests'
        : undefined;

    return (
      <TagSelect
        label="Interests and hobbies"
        placeholder="Select interests"
        searchPlaceholder="Search interests..."
        items={interestItems}
        selectedIds={selectedInterestIds}
        onChanged={setSelectedInterestIds}
        maxSelection={4}
        minSelection={requiresInterests ? 2 : 0}
        error={interestsError}
      />
    );
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={palette.primary[500]} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Ambassador Profile</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Ambassador Type selector (unless employee institution) */}
          {!isEmployee && (
            <Select
              label="Type of Ambassador"
              placeholder="Select ambassador type"
              searchPlaceholder="Search..."
              items={profileTypes}
              value={profileType || null}
              onSelect={handleProfileTypeSelect}
            />
          )}

          {/* Type-specific fields */}
          {renderTypeFields()}

          {/* Bio */}
          <FormInput
            control={control}
            name="describe"
            label="Bio"
            placeholder="Tap to type"
            maxLength={500}
            multiline
            numberOfLines={6}
            inputStyle={{ minHeight: 120, textAlignVertical: 'top' }}
            rules={{
              required: 'Required',
              minLength: { value: 10, message: 'Must be at least 10 characters' },
            }}
          />

          {/* First message */}
          <FormInput
            control={control}
            name="introduction"
            label="First message"
            placeholder="Tap to type"
            maxLength={280}
            multiline
            numberOfLines={4}
            inputStyle={{ minHeight: 90, textAlignVertical: 'top' }}
            rules={{
              required: 'Required',
              minLength: { value: 10, message: 'Must be at least 10 characters' },
            }}
          />

          {/* Interests */}
          {renderInterests()}

          {/* Save */}
          <Button
            title={isSaving ? 'Saved' : 'Save changes'}
            onPress={handleSubmit(onSubmit)}
            loading={isSaving}
            disabled={isSaving}
            size="lg"
            leftIcon={
              isSaving ? (
                <Ionicons name="checkmark" size={18} color="#fff" />
              ) : undefined
            }
            style={{ marginTop: spacing.md }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date pickers */}
      {childDatePickerIndex !== null && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempChildDate}
          mode="date"
          display="spinner"
          onChange={handleChildDateChange}
          maximumDate={new Date()}
        />
      )}

      {childDatePickerIndex !== null && Platform.OS === 'ios' && (
        <Modal transparent animationType="fade">
          <View style={styles.dateModalOverlay}>
            <View style={[styles.dateModalContent, { backgroundColor: colors.background.primary }]}>
              <View style={styles.dateModalHeader}>
                <Pressable onPress={() => setChildDatePickerIndex(null)}>
                  <ThemedText style={[styles.dateModalButton, { color: colors.text.secondary }]}>Cancel</ThemedText>
                </Pressable>
                <Pressable onPress={handleChildDateDone}>
                  <ThemedText style={[styles.dateModalButton, { color: palette.primary[500] }]}>Done</ThemedText>
                </Pressable>
              </View>
              <DateTimePicker
                value={tempChildDate}
                mode="date"
                display="spinner"
                onChange={handleChildDateChange}
                maximumDate={new Date()}
              />
            </View>
          </View>
        </Modal>
      )}

      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempWorkingSinceDate}
          mode="date"
          display="spinner"
          onChange={handleWorkingSinceDateChange}
          maximumDate={new Date()}
        />
      )}

      {showDatePicker && Platform.OS === 'ios' && (
        <Modal transparent animationType="fade">
          <View style={styles.dateModalOverlay}>
            <View style={[styles.dateModalContent, { backgroundColor: colors.background.primary }]}>
              <View style={styles.dateModalHeader}>
                <Pressable onPress={() => setShowDatePicker(false)}>
                  <ThemedText style={[styles.dateModalButton, { color: colors.text.secondary }]}>Cancel</ThemedText>
                </Pressable>
                <Pressable onPress={handleWorkingSinceDateDone}>
                  <ThemedText style={[styles.dateModalButton, { color: palette.primary[500] }]}>Done</ThemedText>
                </Pressable>
              </View>
              <DateTimePicker
                value={tempWorkingSinceDate}
                mode="date"
                display="spinner"
                onChange={handleWorkingSinceDateChange}
                maximumDate={new Date()}
              />
            </View>
          </View>
        </Modal>
      )}
    </ThemedView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 0,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  childrenSection: {
    marginBottom: 8,
  },
  childCard: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  childLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  childField: {
    marginBottom: 16,
  },
  addButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dateModalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },
  dateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateModalButton: {
    fontSize: 17,
    fontWeight: '600',
  },
});

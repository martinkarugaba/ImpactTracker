"use client";

import { useMemo } from "react";
import { type Participant } from "@/features/participants/types/types";

// Attendance record type with participant data
export interface AttendanceRecord {
  id: string;
  session_id: string;
  participant_id: string;
  attendance_status: "attended" | "absent" | "late" | "excused" | "invited";
  participant?: Participant;
  participantName?: string;
}

export interface AttendanceAnalytics {
  total: number;
  totalAttended: number;
  totalAbsent: number;
  totalLate: number;
  totalExcused: number;
  attendanceRate: number;
  demographics: {
    // Overall demographics
    urban: number;
    rural: number;
    youth: number;
    above35: number;
    male: number;
    female: number;
    male15to35: number;
    maleAbove35: number;
    female15to35: number;
    femaleAbove35: number;
    pwds: number;
    femalePWDs: number;
    malePWDs: number;

    // Attendance-specific demographics
    attendedUrban: number;
    attendedRural: number;
    attendedYouth: number;
    attendedAbove35: number;
    attendedMale: number;
    attendedFemale: number;
    attendedPWDs: number;

    // Percentages
    urbanPercentage: number;
    ruralPercentage: number;
    youthPercentage: number;
    femalePercentage: number;
    pwdPercentage: number;

    // Attendance rates by demographic
    urbanAttendanceRate: number;
    ruralAttendanceRate: number;
    youthAttendanceRate: number;
    above35AttendanceRate: number;
    maleAttendanceRate: number;
    femaleAttendanceRate: number;
    pwdAttendanceRate: number;
  };
  employment: {
    youthInWork: number;
    youthInWorkAttended: number;
    wageEmployed: number;
    wageEmployedAttended: number;
    selfEmployed: number;
    selfEmployedAttended: number;
    secondaryEmployed: number;
    secondaryEmployedAttended: number;

    // Attendance rates
    youthInWorkAttendanceRate: number;
    wageEmployedAttendanceRate: number;
    selfEmployedAttendanceRate: number;
    secondaryEmployedAttendanceRate: number;
  };
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: Date | string | null): number {
  if (!dateOfBirth) return 0;

  const birthDate =
    typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;

  if (isNaN(birthDate.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Calculate attendance analytics from attendance records
 * This hook can be used across different features to analyze attendance patterns
 */
export function useAttendanceAnalytics(
  attendanceRecords: AttendanceRecord[]
): AttendanceAnalytics {
  return useMemo(() => {
    // Filter out records without participant data
    const validRecords = attendanceRecords.filter(record => record.participant);

    const total = validRecords.length;
    const attendedRecords = validRecords.filter(
      r => r.attendance_status === "attended"
    );
    const absentRecords = validRecords.filter(
      r => r.attendance_status === "absent"
    );
    const lateRecords = validRecords.filter(
      r => r.attendance_status === "late"
    );
    const excusedRecords = validRecords.filter(
      r => r.attendance_status === "excused"
    );

    const totalAttended = attendedRecords.length;
    const totalAbsent = absentRecords.length;
    const totalLate = lateRecords.length;
    const totalExcused = excusedRecords.length;

    const attendanceRate =
      total > 0 ? Math.round((totalAttended / total) * 100) : 0;

    // Calculate demographics for all participants
    let urban = 0,
      rural = 0,
      youth = 0,
      above35 = 0;
    let male = 0,
      female = 0,
      male15to35 = 0,
      maleAbove35 = 0;
    let female15to35 = 0,
      femaleAbove35 = 0;
    let pwds = 0,
      femalePWDs = 0,
      malePWDs = 0;

    // Calculate demographics for those who attended
    let attendedUrban = 0,
      attendedRural = 0,
      attendedYouth = 0,
      attendedAbove35 = 0;
    let attendedMale = 0,
      attendedFemale = 0,
      attendedPWDs = 0;

    // Employment metrics
    let youthInWork = 0,
      youthInWorkAttended = 0;
    let wageEmployed = 0,
      wageEmployedAttended = 0;
    let selfEmployed = 0,
      selfEmployedAttended = 0;
    let secondaryEmployed = 0,
      secondaryEmployedAttended = 0;

    validRecords.forEach(record => {
      const participant = record.participant!;
      const age = calculateAge(participant.dateOfBirth);
      const isYouth = age >= 15 && age <= 35;
      const isAbove35 = age > 35;
      const isMale = participant.sex === "male";
      const isFemale = participant.sex === "female";
      const isPWD = participant.isPWD === "yes";
      const isUrban = participant.locationSetting === "urban";
      const isRural = participant.locationSetting === "rural";
      const attended = record.attendance_status === "attended";

      // Overall demographics
      if (isUrban) urban++;
      if (isRural) rural++;
      if (isYouth) youth++;
      if (isAbove35) above35++;
      if (isMale) male++;
      if (isFemale) female++;
      if (isMale && isYouth) male15to35++;
      if (isMale && isAbove35) maleAbove35++;
      if (isFemale && isYouth) female15to35++;
      if (isFemale && isAbove35) femaleAbove35++;
      if (isPWD) pwds++;
      if (isPWD && isFemale) femalePWDs++;
      if (isPWD && isMale) malePWDs++;

      // Attendance demographics
      if (attended) {
        if (isUrban) attendedUrban++;
        if (isRural) attendedRural++;
        if (isYouth) attendedYouth++;
        if (isAbove35) attendedAbove35++;
        if (isMale) attendedMale++;
        if (isFemale) attendedFemale++;
        if (isPWD) attendedPWDs++;
      }

      // Employment metrics
      const hasYouthWork = participant.populationSegment === "youth";
      const hasWageEmployment = participant.wageEmploymentStatus === "yes";
      const hasSelfEmployment = participant.selfEmploymentStatus === "yes";
      const hasSecondaryEmployment =
        participant.secondaryEmploymentStatus === "yes";

      if (hasYouthWork) {
        youthInWork++;
        if (attended) youthInWorkAttended++;
      }
      if (hasWageEmployment) {
        wageEmployed++;
        if (attended) wageEmployedAttended++;
      }
      if (hasSelfEmployment) {
        selfEmployed++;
        if (attended) selfEmployedAttended++;
      }
      if (hasSecondaryEmployment) {
        secondaryEmployed++;
        if (attended) secondaryEmployedAttended++;
      }
    });

    // Calculate percentages
    const urbanPercentage = total > 0 ? Math.round((urban / total) * 100) : 0;
    const ruralPercentage = total > 0 ? Math.round((rural / total) * 100) : 0;
    const youthPercentage = total > 0 ? Math.round((youth / total) * 100) : 0;
    const femalePercentage = total > 0 ? Math.round((female / total) * 100) : 0;
    const pwdPercentage = total > 0 ? Math.round((pwds / total) * 100) : 0;

    // Calculate attendance rates by demographic
    const urbanAttendanceRate =
      urban > 0 ? Math.round((attendedUrban / urban) * 100) : 0;
    const ruralAttendanceRate =
      rural > 0 ? Math.round((attendedRural / rural) * 100) : 0;
    const youthAttendanceRate =
      youth > 0 ? Math.round((attendedYouth / youth) * 100) : 0;
    const above35AttendanceRate =
      above35 > 0 ? Math.round((attendedAbove35 / above35) * 100) : 0;
    const maleAttendanceRate =
      male > 0 ? Math.round((attendedMale / male) * 100) : 0;
    const femaleAttendanceRate =
      female > 0 ? Math.round((attendedFemale / female) * 100) : 0;
    const pwdAttendanceRate =
      pwds > 0 ? Math.round((attendedPWDs / pwds) * 100) : 0;

    // Calculate employment attendance rates
    const youthInWorkAttendanceRate =
      youthInWork > 0
        ? Math.round((youthInWorkAttended / youthInWork) * 100)
        : 0;
    const wageEmployedAttendanceRate =
      wageEmployed > 0
        ? Math.round((wageEmployedAttended / wageEmployed) * 100)
        : 0;
    const selfEmployedAttendanceRate =
      selfEmployed > 0
        ? Math.round((selfEmployedAttended / selfEmployed) * 100)
        : 0;
    const secondaryEmployedAttendanceRate =
      secondaryEmployed > 0
        ? Math.round((secondaryEmployedAttended / secondaryEmployed) * 100)
        : 0;

    return {
      total,
      totalAttended,
      totalAbsent,
      totalLate,
      totalExcused,
      attendanceRate,
      demographics: {
        urban,
        rural,
        youth,
        above35,
        male,
        female,
        male15to35,
        maleAbove35,
        female15to35,
        femaleAbove35,
        pwds,
        femalePWDs,
        malePWDs,
        attendedUrban,
        attendedRural,
        attendedYouth,
        attendedAbove35,
        attendedMale,
        attendedFemale,
        attendedPWDs,
        urbanPercentage,
        ruralPercentage,
        youthPercentage,
        femalePercentage,
        pwdPercentage,
        urbanAttendanceRate,
        ruralAttendanceRate,
        youthAttendanceRate,
        above35AttendanceRate,
        maleAttendanceRate,
        femaleAttendanceRate,
        pwdAttendanceRate,
      },
      employment: {
        youthInWork,
        youthInWorkAttended,
        wageEmployed,
        wageEmployedAttended,
        selfEmployed,
        selfEmployedAttended,
        secondaryEmployed,
        secondaryEmployedAttended,
        youthInWorkAttendanceRate,
        wageEmployedAttendanceRate,
        selfEmployedAttendanceRate,
        secondaryEmployedAttendanceRate,
      },
    };
  }, [attendanceRecords]);
}

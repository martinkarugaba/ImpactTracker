import { useMemo } from "react";
import { type Participant } from "../types/types";

// Helper function to calculate age from date of birth or use existing age
function calculateAge(participant: Participant): number | null {
  if (participant.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(participant.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age : null;
  }

  return participant.age || null;
}

// Function to calculate comprehensive detailed metrics for all tabs
function calculateParticipantMetrics(participants: Participant[]) {
  const total = participants.length;

  // Demographics - Basic counts
  const male = participants.filter(p => p.sex === "male").length;
  const female = participants.filter(p => p.sex === "female").length;
  const youth = participants.filter(p => {
    const age = calculateAge(p);
    return age !== null && age >= 15 && age <= 35;
  }).length;
  const above35 = participants.filter(p => {
    const age = calculateAge(p);
    return age !== null && age > 35;
  }).length;
  const pwds = participants.filter(p => p.isPWD === "yes").length;

  // Demographics - Gender and Age breakdowns
  const male15to35 = participants.filter(p => {
    const age = calculateAge(p);
    return p.sex === "male" && age !== null && age >= 15 && age <= 35;
  }).length;
  const maleAbove35 = participants.filter(p => {
    const age = calculateAge(p);
    return p.sex === "male" && age !== null && age > 35;
  }).length;
  const female15to35 = participants.filter(p => {
    const age = calculateAge(p);
    return p.sex === "female" && age !== null && age >= 15 && age <= 35;
  }).length;
  const femaleAbove35 = participants.filter(p => {
    const age = calculateAge(p);
    return p.sex === "female" && age !== null && age > 35;
  }).length;

  // Demographics - PWDs by gender
  const femalePWDs = participants.filter(
    p => p.isPWD === "yes" && p.sex === "female"
  ).length;
  const malePWDs = participants.filter(
    p => p.isPWD === "yes" && p.sex === "male"
  ).length;

  // Location demographics
  const urban = participants.filter(p => p.locationSetting === "urban").length;
  const rural = participants.filter(
    p => p.locationSetting === "rural" || !p.locationSetting
  ).length;

  // Youth in work
  const youthInWork = participants.filter(p => {
    const age = calculateAge(p);
    return (
      age !== null &&
      age >= 15 &&
      age <= 35 &&
      p.employmentStatus &&
      p.employmentStatus !== "unemployed"
    );
  }).length;
  const youthInWorkUrban = participants.filter(p => {
    const age = calculateAge(p);
    return (
      age !== null &&
      age >= 15 &&
      age <= 35 &&
      p.employmentStatus &&
      p.employmentStatus !== "unemployed" &&
      p.locationSetting === "urban"
    );
  }).length;
  const youthInWorkRural = participants.filter(p => {
    const age = calculateAge(p);
    return (
      age !== null &&
      age >= 15 &&
      age <= 35 &&
      p.employmentStatus &&
      p.employmentStatus !== "unemployed" &&
      (p.locationSetting === "rural" || !p.locationSetting)
    );
  }).length;

  // Wage Employment - Basic counts
  const wageEmployed = participants.filter(
    p => p.employmentStatus === "wage-employed"
  ).length;
  const wageEmployedMale = participants.filter(
    p => p.employmentStatus === "wage-employed" && p.sex === "male"
  ).length;
  const wageEmployedFemale = participants.filter(
    p => p.employmentStatus === "wage-employed" && p.sex === "female"
  ).length;

  // Wage Employment - Age and Gender breakdowns
  const wageEmployedMale15to35 = participants.filter(p => {
    const age = calculateAge(p);
    return (
      p.employmentStatus === "wage-employed" &&
      p.sex === "male" &&
      age !== null &&
      age >= 15 &&
      age <= 35
    );
  }).length;
  const wageEmployedMaleAbove35 = participants.filter(p => {
    const age = calculateAge(p);
    return (
      p.employmentStatus === "wage-employed" &&
      p.sex === "male" &&
      age !== null &&
      age > 35
    );
  }).length;
  const wageEmployedFemale15to35 = participants.filter(p => {
    const age = calculateAge(p);
    return (
      p.employmentStatus === "wage-employed" &&
      p.sex === "female" &&
      age !== null &&
      age >= 15 &&
      age <= 35
    );
  }).length;
  const wageEmployedFemaleAbove35 = participants.filter(p => {
    const age = calculateAge(p);
    return (
      p.employmentStatus === "wage-employed" &&
      p.sex === "female" &&
      age !== null &&
      age > 35
    );
  }).length;

  // Wage Employment - Location and PWDs
  const wageEmployedUrban = participants.filter(
    p => p.employmentStatus === "wage-employed" && p.locationSetting === "urban"
  ).length;
  const wageEmployedRural = participants.filter(
    p =>
      p.employmentStatus === "wage-employed" &&
      (p.locationSetting === "rural" || !p.locationSetting)
  ).length;
  const wageEmployedPWDs = participants.filter(
    p => p.employmentStatus === "wage-employed" && p.isPWD === "yes"
  ).length;
  const wageEmployedFemalePWDs = participants.filter(
    p =>
      p.employmentStatus === "wage-employed" &&
      p.isPWD === "yes" &&
      p.sex === "female"
  ).length;
  const wageEmployedMalePWDs = participants.filter(
    p =>
      p.employmentStatus === "wage-employed" &&
      p.isPWD === "yes" &&
      p.sex === "male"
  ).length;

  // Self Employment - Basic counts
  const selfEmployed = participants.filter(
    p => p.employmentStatus === "self-employed"
  ).length;
  const selfEmployedMale = participants.filter(
    p => p.employmentStatus === "self-employed" && p.sex === "male"
  ).length;
  const selfEmployedFemale = participants.filter(
    p => p.employmentStatus === "self-employed" && p.sex === "female"
  ).length;

  // Self Employment - Age and Gender breakdowns
  const selfEmployedMale15to35 = participants.filter(p => {
    const age = calculateAge(p);
    return (
      p.employmentStatus === "self-employed" &&
      p.sex === "male" &&
      age !== null &&
      age >= 15 &&
      age <= 35
    );
  }).length;
  const selfEmployedMaleAbove35 = participants.filter(p => {
    const age = calculateAge(p);
    return (
      p.employmentStatus === "self-employed" &&
      p.sex === "male" &&
      age !== null &&
      age > 35
    );
  }).length;
  const selfEmployedFemale15to35 = participants.filter(p => {
    const age = calculateAge(p);
    return (
      p.employmentStatus === "self-employed" &&
      p.sex === "female" &&
      age !== null &&
      age >= 15 &&
      age <= 35
    );
  }).length;
  const selfEmployedFemaleAbove35 = participants.filter(p => {
    const age = calculateAge(p);
    return (
      p.employmentStatus === "self-employed" &&
      p.sex === "female" &&
      age !== null &&
      age > 35
    );
  }).length;

  // Self Employment - Location and PWDs
  const selfEmployedUrban = participants.filter(
    p => p.employmentStatus === "self-employed" && p.locationSetting === "urban"
  ).length;
  const selfEmployedRural = participants.filter(
    p =>
      p.employmentStatus === "self-employed" &&
      (p.locationSetting === "rural" || !p.locationSetting)
  ).length;
  const selfEmployedPWDs = participants.filter(
    p => p.employmentStatus === "self-employed" && p.isPWD === "yes"
  ).length;
  const selfEmployedFemalePWDs = participants.filter(
    p =>
      p.employmentStatus === "self-employed" &&
      p.isPWD === "yes" &&
      p.sex === "female"
  ).length;
  const selfEmployedMalePWDs = participants.filter(
    p =>
      p.employmentStatus === "self-employed" &&
      p.isPWD === "yes" &&
      p.sex === "male"
  ).length;

  // Secondary Employment - Basic counts
  const secondaryEmployed = participants.filter(
    p =>
      p.employmentStatus === "secondary-employed" ||
      p.employmentStatus === "multiple-jobs"
  ).length;
  const secondaryEmployedMale = participants.filter(
    p =>
      (p.employmentStatus === "secondary-employed" ||
        p.employmentStatus === "multiple-jobs") &&
      p.sex === "male"
  ).length;
  const secondaryEmployedFemale = participants.filter(
    p =>
      (p.employmentStatus === "secondary-employed" ||
        p.employmentStatus === "multiple-jobs") &&
      p.sex === "female"
  ).length;

  // Secondary Employment - Age and Gender breakdowns
  const secondaryEmployedMale15to35 = participants.filter(p => {
    const age = calculateAge(p);
    return (
      (p.employmentStatus === "secondary-employed" ||
        p.employmentStatus === "multiple-jobs") &&
      p.sex === "male" &&
      age !== null &&
      age >= 15 &&
      age <= 35
    );
  }).length;
  const secondaryEmployedMaleAbove35 = participants.filter(p => {
    const age = calculateAge(p);
    return (
      (p.employmentStatus === "secondary-employed" ||
        p.employmentStatus === "multiple-jobs") &&
      p.sex === "male" &&
      age !== null &&
      age > 35
    );
  }).length;
  const secondaryEmployedFemale15to35 = participants.filter(p => {
    const age = calculateAge(p);
    return (
      (p.employmentStatus === "secondary-employed" ||
        p.employmentStatus === "multiple-jobs") &&
      p.sex === "female" &&
      age !== null &&
      age >= 15 &&
      age <= 35
    );
  }).length;
  const secondaryEmployedFemaleAbove35 = participants.filter(p => {
    const age = calculateAge(p);
    return (
      (p.employmentStatus === "secondary-employed" ||
        p.employmentStatus === "multiple-jobs") &&
      p.sex === "female" &&
      age !== null &&
      age > 35
    );
  }).length;

  // Secondary Employment - Location and PWDs
  const secondaryEmployedUrban = participants.filter(
    p =>
      (p.employmentStatus === "secondary-employed" ||
        p.employmentStatus === "multiple-jobs") &&
      p.locationSetting === "urban"
  ).length;
  const secondaryEmployedRural = participants.filter(
    p =>
      (p.employmentStatus === "secondary-employed" ||
        p.employmentStatus === "multiple-jobs") &&
      (p.locationSetting === "rural" || !p.locationSetting)
  ).length;
  const secondaryEmployedPWDs = participants.filter(
    p =>
      (p.employmentStatus === "secondary-employed" ||
        p.employmentStatus === "multiple-jobs") &&
      p.isPWD === "yes"
  ).length;
  const secondaryEmployedFemalePWDs = participants.filter(
    p =>
      (p.employmentStatus === "secondary-employed" ||
        p.employmentStatus === "multiple-jobs") &&
      p.isPWD === "yes" &&
      p.sex === "female"
  ).length;
  const secondaryEmployedMalePWDs = participants.filter(
    p =>
      (p.employmentStatus === "secondary-employed" ||
        p.employmentStatus === "multiple-jobs") &&
      p.isPWD === "yes" &&
      p.sex === "male"
  ).length;

  // Skills & Financial data
  const hasVocationalSkills = participants.filter(
    p => p.hasVocationalSkills === "yes"
  ).length;
  const hasBusinessSkills = participants.filter(
    p => p.hasBusinessSkills === "yes"
  ).length;
  const vslaMembers = participants.filter(
    p => p.isSubscribedToVSLA === "yes"
  ).length;
  const enterpriseOwners = participants.filter(
    p => p.ownsEnterprise === "yes"
  ).length;

  // Calculate percentages
  const calculatePercentage = (count: number) =>
    total > 0 ? Math.round((count / total) * 100) : 0;

  return {
    total,
    demographics: {
      // Basic demographics
      male,
      female,
      youth,
      above35,
      pwds,
      urban,
      rural,
      // Gender and age breakdowns
      male15to35,
      maleAbove35,
      female15to35,
      femaleAbove35,
      // PWDs by gender
      femalePWDs,
      malePWDs,
      // Percentages
      femalePercentage: calculatePercentage(female),
      youthPercentage: calculatePercentage(youth),
      pwdPercentage: calculatePercentage(pwds),
      urbanPercentage: calculatePercentage(urban),
      ruralPercentage: calculatePercentage(rural),
    },
    youthEmployment: {
      youthInWork,
      youthInWorkUrban,
      youthInWorkRural,
      youthInWorkPercentage: calculatePercentage(youthInWork),
    },
    wageEmployment: {
      total: wageEmployed,
      male: wageEmployedMale,
      female: wageEmployedFemale,
      male15to35: wageEmployedMale15to35,
      maleAbove35: wageEmployedMaleAbove35,
      female15to35: wageEmployedFemale15to35,
      femaleAbove35: wageEmployedFemaleAbove35,
      urban: wageEmployedUrban,
      rural: wageEmployedRural,
      pwds: wageEmployedPWDs,
      femalePWDs: wageEmployedFemalePWDs,
      malePWDs: wageEmployedMalePWDs,
      percentage: calculatePercentage(wageEmployed),
    },
    selfEmployment: {
      total: selfEmployed,
      male: selfEmployedMale,
      female: selfEmployedFemale,
      male15to35: selfEmployedMale15to35,
      maleAbove35: selfEmployedMaleAbove35,
      female15to35: selfEmployedFemale15to35,
      femaleAbove35: selfEmployedFemaleAbove35,
      urban: selfEmployedUrban,
      rural: selfEmployedRural,
      pwds: selfEmployedPWDs,
      femalePWDs: selfEmployedFemalePWDs,
      malePWDs: selfEmployedMalePWDs,
      percentage: calculatePercentage(selfEmployed),
    },
    secondaryEmployment: {
      total: secondaryEmployed,
      male: secondaryEmployedMale,
      female: secondaryEmployedFemale,
      male15to35: secondaryEmployedMale15to35,
      maleAbove35: secondaryEmployedMaleAbove35,
      female15to35: secondaryEmployedFemale15to35,
      femaleAbove35: secondaryEmployedFemaleAbove35,
      urban: secondaryEmployedUrban,
      rural: secondaryEmployedRural,
      pwds: secondaryEmployedPWDs,
      femalePWDs: secondaryEmployedFemalePWDs,
      malePWDs: secondaryEmployedMalePWDs,
      percentage: calculatePercentage(secondaryEmployed),
    },
    skills: {
      hasVocationalSkills,
      hasBusinessSkills,
      vocationalRate: calculatePercentage(hasVocationalSkills),
      businessRate: calculatePercentage(hasBusinessSkills),
    },
    financial: {
      vslaMembers,
      enterpriseOwners,
      vslaRate: calculatePercentage(vslaMembers),
      enterpriseRate: calculatePercentage(enterpriseOwners),
    },
  };
}

export function useCalculatedParticipantMetrics(participants: Participant[]) {
  return useMemo(
    () => calculateParticipantMetrics(participants),
    [participants]
  );
}

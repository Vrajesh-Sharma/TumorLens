import React from 'react';
import { Redirect } from 'expo-router';

export default function PatientsRedirect() {
  return <Redirect href="/(tabs)/history" />;
}

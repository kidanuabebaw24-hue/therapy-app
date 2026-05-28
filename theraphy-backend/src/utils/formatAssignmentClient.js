export const formatPatientForTherapist = (patient) => {
  if (!patient) return null;
  const user = patient.user || {};
  return {
    id: patient.id,
    userId: patient.userId,
    name: user.name || patient.name || 'Client',
    email: user.email || patient.email || '',
    phone: user.phone || patient.phone || null,
    primaryPhobia: patient.primaryPhobia ?? null,
    currentAnxietyLevel: patient.currentAnxietyLevel ?? null,
    age: patient.age ?? null,
    gender: patient.gender ?? null,
  };
};

export const formatAssignmentForTherapist = (assignment) => ({
  id: assignment.id,
  patientId: assignment.patientId,
  therapistId: assignment.therapistId,
  assignedDate: assignment.assignedAt,
  assignedAt: assignment.assignedAt,
  status: assignment.status,
  patient: formatPatientForTherapist(assignment.patient),
});

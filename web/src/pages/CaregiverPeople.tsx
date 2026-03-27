import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Users, Loader2, Mail, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { isCaregiverRole } from '@/lib/roles';
import { appPath } from '@/lib/appRoutes';
import { caregiversApi, type PatientSummaryDto } from '@/api/client';

export default function CaregiverPeople() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    caregiversApi
      .myPatients()
      .then((r) => setPatients(r.data))
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, []);

  if (!isCaregiverRole(user?.role)) {
    return <Navigate to={appPath()} replace />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-violet-600">Directory</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-gray-900 sm:text-3xl">People you support</h1>
        <p className="mt-2 text-sm text-gray-600">
          Patients linked to your caregiver account. Device and schedule detail lives under Devices and Schedules; each
          device shows which patient owns it.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : patients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-8 text-center">
          <Users className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-700">No linked patients</p>
          <p className="mt-1 text-xs text-gray-500">
            Demo: <span className="font-mono">caregiver@demo.com</span> / <span className="font-mono">Demo123!</span> — three
            seeded patients (including <span className="font-mono">patient@demo.com</span>,{' '}
            <span className="font-mono">maria.schneider@demo.com</span>, <span className="font-mono">hans.weber@demo.com</span>
            ).
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {patients.map((p) => (
            <li
              key={p.id}
              className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{p.fullName}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {p.email}
                </p>
                <p className="mt-2 font-mono text-[11px] text-gray-400">User ID: {p.id}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Users, Box, Bell, Activity, Loader2, ArrowRight } from 'lucide-react';
import { appPath } from '@/lib/appRoutes';
import {
  devicesApi,
  caregiversApi,
  notificationsApi,
  adherenceApi,
  type DeviceDto,
  type PatientSummaryDto,
  type NotificationDto,
  type AdherenceSummaryDto,
} from '@/api/client';

export default function CaregiverDashboard() {
  const [devices, setDevices] = useState<DeviceDto[]>([]);
  const [patients, setPatients] = useState<PatientSummaryDto[]>([]);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [adherenceByPatient, setAdherenceByPatient] = useState<Record<string, AdherenceSummaryDto>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [devRes, patRes, notifRes] = await Promise.all([
          devicesApi.list(),
          caregiversApi.myPatients(),
          notificationsApi.list(50),
        ]);
        if (cancelled) return;
        setDevices(devRes.data);
        setPatients(patRes.data);
        setNotifications(notifRes.data);

        const adherenceEntries = await Promise.all(
          patRes.data.map(async (p) => {
            try {
              const r = await adherenceApi.me({ forPatientUserId: p.id });
              return [p.id, r.data] as const;
            } catch {
              return [p.id, null] as const;
            }
          }),
        );
        if (cancelled) return;
        const map: Record<string, AdherenceSummaryDto> = {};
        for (const [id, a] of adherenceEntries) {
          if (a) map[id] = a;
        }
        setAdherenceByPatient(map);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const unread = notifications.filter((n) => !n.isRead).length;
  const onlineDevices = devices.filter((d) => d.status === 'Active').length;

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-600" aria-hidden />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-violet-600">Caregiver workspace</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Team overview
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Monitor linked patients, shared devices, and alerts. Travel mode and device registration stay on the patient
          sign-in; you manage schedules, history, and integrations from here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-violet-700">
            <Users className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Linked patients</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">{patients.length}</p>
          <Link
            to={appPath('/people')}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:text-violet-900"
          >
            View directory <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-teal-700">
            <Box className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Devices (all patients)</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">{devices.length}</p>
          <p className="mt-1 text-xs text-gray-500">{onlineDevices} active / visible in Devices</p>
          <Link
            to={appPath('/devices')}
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-900"
          >
            Open devices <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-amber-800">
            <Bell className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Your alerts</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">{unread}</p>
          <p className="mt-1 text-xs text-gray-500">Unread notifications</p>
          <Link
            to={appPath('/notifications')}
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-amber-800 hover:text-amber-950"
          >
            Inbox <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-semibold text-gray-900">Adherence by patient</h2>
          </div>
        </div>
        {patients.length === 0 ? (
          <p className="text-sm text-gray-500">
            No patients are linked to this caregiver yet. Assign a caregiver in user profile or seed data to see demo
            rows.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {patients.map((p) => {
              const a = adherenceByPatient[p.id];
              return (
                <li key={p.id} className="flex flex-col gap-1 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{p.fullName}</p>
                    <p className="text-xs text-gray-500">{p.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold tabular-nums text-gray-900">
                      {a ? `${a.adherencePercent}%` : '—'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {a ? `${a.confirmed} confirmed · ${a.missed} missed` : 'No data'}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

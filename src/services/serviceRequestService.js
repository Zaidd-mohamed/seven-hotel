import { db } from "../firebase/firebase";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

export const SERVICE_TYPES = [
  "HOUSEKEEPING",
  "DINING",
  "TRANSPORT",
  "MAINTENANCE",
];

export function getAssignedRoleByType(type) {
  if (type === "HOUSEKEEPING") return "housekeeping";
  // simplified routing:
  return "receptionist";
}

export async function createServiceRequest({
  hotelId,
  userId,
  bookingId = null,
  type,
  message,
}) {
  const assignedRole = getAssignedRoleByType(type);

  const ref = await addDoc(collection(db, "serviceRequests"), {
    hotelId,
    userId,
    bookingId,
    type,
    assignedRole,
    assignedToUid: null,
    status: "NEW",
    message,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
    updatedBy: userId,
  });

  // audit log
  await addDoc(collection(db, "auditLogs"), {
    actorUid: userId,
    action: "CREATE_REQUEST",
    targetType: "serviceRequest",
    targetId: ref.id,
    timestamp: serverTimestamp(),
  });

  // notification for guest (optional confirmation)
  await addDoc(collection(db, "notifications"), {
    userId,
    hotelId,
    title: "Request Received",
    message: `Your ${type.toLowerCase()} request was submitted.`,
    type: "SERVICE_REQUEST",
    status: "UNREAD",
    createdAt: serverTimestamp(),
  });

  return ref.id;
}

// Real-time listener for guest's own requests
export function listenGuestRequests(userId, onData, onError) {
  const q = query(collection(db, "serviceRequests"), where("userId", "==", userId));

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // sort client-side (avoid indexes)
      items.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime;
      });
      onData(items);
    },
    (err) => onError?.(err)
  );
}

// Real-time listener for staff dashboard
export function listenStaffRequests({ hotelId, staffRole }, onData, onError) {
  const q = query(
    collection(db, "serviceRequests"),
    where("hotelId", "==", hotelId),
    where("assignedRole", "==", staffRole)
  );

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort by status priority: NEW, IN_PROGRESS, DONE
      const priority = { NEW: 0, IN_PROGRESS: 1, DONE: 2 };
      items.sort((a, b) => (priority[a.status] ?? 9) - (priority[b.status] ?? 9));
      onData(items);
    },
    (err) => onError?.(err)
  );
}

export async function updateRequestStatus({
  requestId,
  newStatus,
  actorUid,
  actorRole,
  guestUserId,
  hotelId,
}) {
  await updateDoc(doc(db, "serviceRequests", requestId), {
    status: newStatus,
    updatedAt: serverTimestamp(),
    updatedBy: actorUid,
  });

  // audit log
  await addDoc(collection(db, "auditLogs"), {
    actorUid,
    actorRole: actorRole || null,
    action: "UPDATE_REQUEST_STATUS",
    targetType: "serviceRequest",
    targetId: requestId,
    timestamp: serverTimestamp(),
    metadata: { status: newStatus },
  });

  // notify guest
  await addDoc(collection(db, "notifications"), {
    userId: guestUserId,
    hotelId,
    title: "Request Updated",
    message: `Your request is now: ${newStatus.replace("_", " ")}`,
    type: "SERVICE_REQUEST_STATUS",
    status: "UNREAD",
    createdAt: serverTimestamp(),
  });
}

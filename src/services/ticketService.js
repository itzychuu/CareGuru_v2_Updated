import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  runTransaction, 
  orderBy, 
  limit,
  serverTimestamp,
  arrayUnion,
  getDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Generates tickets for a doctor on a specific date based on dailyCapacity.
 * Ensures tickets are generated only once per doctor per day.
 */
export const generateDailyTickets = async (doctorId, hospitalId, date, capacity) => {
  try {
    // 1. Fetch existing tickets for this doctor and date (without orderBy to avoid index)
    const q = query(
      collection(db, "opTickets"),
      where("doctorId", "==", doctorId),
      where("date", "==", date)
    );
    const querySnapshot = await getDocs(q);
    
    let startNumber = 1;
    if (!querySnapshot.empty) {
      // Find highest number in memory
      const tickets = querySnapshot.docs.map(d => d.data().ticketNumber || 0);
      const highestNumber = Math.max(...tickets);
      startNumber = highestNumber + 1;
    }

    if (startNumber - 1 > capacity) {
      // Need to REDUCE capacity - remove unbooked tickets above the new limit
      const toDeleteQuery = query(
        collection(db, "opTickets"),
        where("doctorId", "==", doctorId),
        where("date", "==", date),
        where("status", "==", "available")
      );
      const toDeleteSnapshot = await getDocs(toDeleteQuery);
      const deletePromises = [];
      let deletedCount = 0;

      toDeleteSnapshot.docs.forEach(docSnap => {
        if (docSnap.data().ticketNumber > capacity) {
          deletePromises.push(deleteDoc(docSnap.ref));
          deletedCount++;
        }
      });

      await Promise.all(deletePromises);
      return { success: true, count: -deletedCount, reduction: true };
    }

    // 2. Generate extra tickets (INCREASE)
    const batchPromises = [];
    const countToAdd = capacity - (startNumber - 1);
    
    for (let i = startNumber; i <= capacity; i++) {
       batchPromises.push(addDoc(collection(db, "opTickets"), {
         doctorId,
         hospitalId,
         date,
         ticketNumber: i,
         status: "available",
         bookedBy: null,
         source: null,
         createdAt: serverTimestamp()
       }));
    }
    
    await Promise.all(batchPromises);
    return { success: true, count: countToAdd };
  } catch (error) {
    console.error("Error generating tickets:", error);
    throw error;
  }
};

/**
 * Books the next available ticket for a doctor on a specific date.
 * Uses a transaction to ensure no double booking.
 */
export const bookTicket = async (bookingInfo) => {
  const { 
    doctorId, 
    doctorName,
    hospitalId, 
    hospitalName,
    specialization,
    date, 
    userId, 
    patientName,
    source, // "app", "call", "walk-in"
    paymentMethod = "Hospital Counter"
  } = bookingInfo;

  try {
    return await runTransaction(db, async (transaction) => {
      // 1. Find all available tickets (without orderBy to avoid index)
      const ticketsRef = collection(db, "opTickets");
      const q = query(
        ticketsRef,
        where("doctorId", "==", doctorId),
        where("date", "==", date),
        where("status", "==", "available")
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        throw new Error("No tickets available for this doctor on selected date.");
      }

      // 2. Pick the first one (lowest ticket number) in memory
      const docs = querySnapshot.docs;
      docs.sort((a, b) => (a.data().ticketNumber || 0) - (b.data().ticketNumber || 0));
      const ticketDoc = docs[0];
      const ticketData = ticketDoc.data();
      const ticketId = `OP-${ticketData.ticketNumber}-${date.replace(/-/g, '')}`;

      // 2. Update the ticket status
      transaction.update(ticketDoc.ref, {
        status: "booked",
        bookedBy: userId || null,
        source: source,
        patientName: patientName,
        bookedAt: serverTimestamp()
      });

      // 3. Create an entry in the global 'appointments' collection for dashboard visibility
      const appointmentData = {
        ticketId: ticketId,
        doctorId,
        doctorName,
        hospitalId,
        hospitalName,
        specialization,
        date,
        bookingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "booked",
        userId: userId || "walk-in",
        patientName: patientName,
        source: source,
        paymentMethod: paymentMethod,
        timestamp: serverTimestamp()
      };

      const appointmentRef = doc(collection(db, "appointments"));
      transaction.set(appointmentRef, appointmentData);

      // 4. If booked via app, update user's appointments array
      if (userId && source === "app") {
        const userRef = doc(db, "users", userId);
        transaction.update(userRef, {
          appointments: arrayUnion({ ...appointmentData, id: appointmentRef.id })
        });
      }

      return { success: true, ticketId, ticketNumber: ticketData.ticketNumber };
    });
  } catch (error) {
    console.error("Booking transaction failed: ", error);
    throw error;
  }
};

/**
 * Fetches ticket statistics for a doctor on a specific date.
 */
export const getTicketStats = async (doctorId, date) => {
  try {
    const q = query(
      collection(db, "opTickets"),
      where("doctorId", "==", doctorId),
      where("date", "==", date)
    );
    const querySnapshot = await getDocs(q);
    const tickets = querySnapshot.docs.map(doc => doc.data());
    
    const total = tickets.length;
    const booked = tickets.filter(t => t.status === "booked").length;
    
    return {
      total,
      booked,
      available: total - booked,
      isGenerated: total > 0
    };
  } catch (error) {
    console.error("Error fetching ticket stats:", error);
    throw error;
  }
};

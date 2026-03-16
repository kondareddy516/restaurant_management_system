/**
 * Firestore Database Service Layer
 * Handles all database operations with type safety
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Query,
  QueryConstraint,
  WriteBatch,
  writeBatch,
  Timestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Data Models
 */
export interface MenuItem {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: "starters" | "veg" | "non-veg" | "desserts";
  imageUrl?: string;
  imageId?: string;
  available: boolean;
  preparationTime: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Order {
  id?: string;
  userId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "completed"
    | "cancelled";
  specialInstructions?: string;
  paymentMethod?: "upi" | "card" | "cash";
  paymentStatus?: "pending" | "waiting_verification" | "completed" | "failed";
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Reservation {
  id?: string;
  userId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  date: string;
  time: string;
  numberOfGuests: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  specialRequests?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface UserRole {
  userId: string;
  email: string;
  role: "admin" | "staff" | "customer";
  createdAt?: Timestamp;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role?: string;
  createdAt?: Timestamp;
}

/**
 * Generic helper functions
 */

async function getQueryResults<T>(q: Query): Promise<T[]> {
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as T,
    );
  } catch (error: any) {
    // Check for Firestore index missing error
    if (
      error?.code === "failed-precondition" ||
      error?.message?.includes("index") ||
      error?.message?.includes("composite")
    ) {
      const indexError = new Error(
        "The Royal Archives are being indexed. Please refresh in a few moments.",
      );
      (indexError as any).code = "failed-precondition";
      throw indexError;
    }
    throw error;
  }
}

/**
 * Menu Items Service
 */
export const menuService = {
  /**
   * Get all menu items
   */
  async getAll(category?: string): Promise<MenuItem[]> {
    let q: Query;
    if (category) {
      q = query(collection(db, "menuItems"), where("category", "==", category));
    } else {
      q = query(collection(db, "menuItems"), orderBy("category"));
    }
    return getQueryResults<MenuItem>(q);
  },

  /**
   * Get single menu item
   */
  async getById(id: string): Promise<MenuItem | null> {
    const docRef = doc(db, "menuItems", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists()
      ? ({ id: docSnap.id, ...docSnap.data() } as MenuItem)
      : null;
  },

  /**
   * Create menu item
   */
  async create(
    item: Omit<MenuItem, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "menuItems"), {
      ...item,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  /**
   * Update menu item
   */
  async update(id: string, updates: Partial<MenuItem>): Promise<void> {
    const docRef = doc(db, "menuItems", id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Delete menu item
   */
  async delete(id: string): Promise<void> {
    const docRef = doc(db, "menuItems", id);
    await deleteDoc(docRef);
  },
};

/**
 * Orders Service
 */
export const orderService = {
  /**
   * Get all orders (with filters)
   */
  async getAll(
    userId?: string,
    status?: string,
    userRole?: string,
  ): Promise<Order[]> {
    let constraints: QueryConstraint[] = [];

    // If customer, only return their orders
    if (userRole === "customer" && userId) {
      constraints.push(where("userId", "==", userId));
    }

    // Filter by status if provided
    if (status) {
      constraints.push(where("status", "==", status));
    }

    constraints.push(orderBy("createdAt", "desc"));

    const q = query(collection(db, "orders"), ...constraints);
    return getQueryResults<Order>(q);
  },

  /**
   * Get single order
   */
  async getById(id: string): Promise<Order | null> {
    const docRef = doc(db, "orders", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists()
      ? ({ id: docSnap.id, ...docSnap.data() } as Order)
      : null;
  },

  /**
   * Create order
   */
  async create(
    order: Omit<Order, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "orders"), {
      ...order,
      status: "pending",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  /**
   * Update order status
   */
  async updateStatus(
    id: string,
    status: Order["status"],
    paymentStatus?: "pending" | "waiting_verification" | "completed" | "failed",
  ): Promise<void> {
    const docRef = doc(db, "orders", id);

    // Ensure paymentStatus is never undefined - default to 'waiting_verification'
    const finalPaymentStatus =
      paymentStatus ||
      (status === "completed" ? "completed" : "waiting_verification");

    await updateDoc(docRef, {
      status,
      paymentStatus: finalPaymentStatus,
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Delete order
   */
  async delete(id: string): Promise<void> {
    const docRef = doc(db, "orders", id);
    await deleteDoc(docRef);
  },
};

/**
 * Reservations Service
 */
export const reservationService = {
  /**
   * Get all reservations (with filters)
   */
  async getAll(
    userId?: string,
    date?: string,
    status?: string,
    userRole?: string,
  ): Promise<Reservation[]> {
    let constraints: QueryConstraint[] = [];

    // If customer, only return their reservations
    if (userRole === "customer" && userId) {
      constraints.push(where("userId", "==", userId));
    }

    // Filter by date if provided
    if (date) {
      constraints.push(where("date", "==", date));
    }

    // Filter by status if provided
    if (status) {
      constraints.push(where("status", "==", status));
    }

    constraints.push(orderBy("createdAt", "desc"));

    const q = query(collection(db, "reservations"), ...constraints);
    return getQueryResults<Reservation>(q);
  },

  /**
   * Get single reservation
   */
  async getById(id: string): Promise<Reservation | null> {
    const docRef = doc(db, "reservations", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists()
      ? ({ id: docSnap.id, ...docSnap.data() } as Reservation)
      : null;
  },

  /**
   * Create reservation
   */
  async create(
    reservation: Omit<Reservation, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "reservations"), {
      ...reservation,
      status: "pending",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  /**
   * Update reservation status
   */
  async updateStatus(id: string, status: Reservation["status"]): Promise<void> {
    const docRef = doc(db, "reservations", id);
    await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Cancel reservation
   */
  async cancel(id: string): Promise<void> {
    await this.updateStatus(id, "cancelled");
  },

  /**
   * Delete reservation
   */
  async delete(id: string): Promise<void> {
    const docRef = doc(db, "reservations", id);
    await deleteDoc(docRef);
  },
};

/**
 * User Roles Service
 */
export const userRoleService = {
  /**
   * Get user role
   */
  async getUserRole(userId: string): Promise<string> {
    const docRef = doc(db, "userRoles", userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().role : "customer";
  },

  /**
   * Set user role (admin only)
   */
  async setUserRole(
    userId: string,
    email: string,
    role: string,
  ): Promise<void> {
    const docRef = doc(db, "userRoles", userId);
    await setDoc(docRef, {
      userId,
      email,
      role,
      createdAt: Timestamp.now(),
    });
  },

  /**
   * Get all users with roles (admin only)
   */
  async getAllUsersWithRoles(): Promise<UserRole[]> {
    const q = query(collection(db, "userRoles"));
    return getQueryResults<UserRole>(q);
  },

  /**
   * Delete user role
   */
  async deleteUserRole(userId: string): Promise<void> {
    const docRef = doc(db, "userRoles", userId);
    await deleteDoc(docRef);
  },
};

/**
 * Users Service
 */
export const userService = {
  /**
   * Create or update user profile
   */
  async createOrUpdateUser(
    uid: string,
    email: string,
    displayName?: string,
  ): Promise<void> {
    const docRef = doc(db, "users", uid);
    await setDoc(
      docRef,
      {
        uid,
        email,
        displayName,
        updatedAt: Timestamp.now(),
      },
      { merge: true },
    );

    // Set default role as customer if not already set
    const roleExists = await userRoleService.getUserRole(uid);
    if (roleExists === "customer") {
      await userRoleService.setUserRole(uid, email, "customer");
    }
  },

  /**
   * Get user profile
   */
  async getUserProfile(uid: string): Promise<User | null> {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ ...docSnap.data() } as User) : null;
  },

  /**
   * Delete user
   */
  async deleteUser(uid: string): Promise<void> {
    const docRef = doc(db, "users", uid);
    await deleteDoc(docRef);
  },
};

# Firebase Services Migration - Quick Reference

## Updated Components Overview

### Component Files Changed

1. ✅ `src/pages/Home.tsx` - Removed Convex, uses addToCart prop
2. ✅ `src/pages/Menu.tsx` - Uses `menuService.getAll()` with category filtering
3. ✅ `src/pages/Cart.tsx` - Uses `orderService.create()` to submit orders
4. ✅ `src/pages/Orders.tsx` - Uses `orderService.getAll()` with userId/userRole filtering
5. ✅ `src/pages/Reservations.tsx` - Uses `reservationService` for CRUD operations
6. ✅ `src/pages/AdminDashboard.tsx` - Uses all three services for management

### Key Service Methods Used

#### Menu Service

```typescript
import { menuService } from '../services/firestoreService';

// Get all items (optionally filtered by category)
const items = await menuService.getAll(category?: string);

// Get single item
const item = await menuService.getById(id: string);

// Create item (Admin only)
const id = await menuService.create(item);

// Update item (Admin only)
await menuService.update(id, updates);

// Delete item (Admin only)
await menuService.delete(id);
```

#### Order Service

```typescript
import { orderService } from '../services/firestoreService';

// Get all orders with optional filtering
const orders = await orderService.getAll(
  userId?: string,
  status?: string,
  userRole?: string  // "customer" | "admin" | "staff"
);

// Get single order
const order = await orderService.getById(id);

// Create new order
const orderId = await orderService.create({
  userId?: string,
  customerName: string,
  customerEmail?: string,
  customerPhone: string,
  items: OrderItem[],
  totalAmount: number,
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled",
  specialInstructions?: string,
  paymentMethod?: "upi" | "card" | "cash",
});

// Update order status
await orderService.updateStatus(id, status, paymentStatus?);

// Delete order
await orderService.delete(id);
```

#### Reservation Service

```typescript
import { reservationService } from '../services/firestoreService';

// Get all reservations with optional filtering
const reservations = await reservationService.getAll(
  userId?: string,
  date?: string,
  status?: string,
  userRole?: string  // "customer" | "admin" | "staff"
);

// Get single reservation
const reservation = await reservationService.getById(id);

// Create reservation
const resId = await reservationService.create({
  userId?: string,
  customerName: string,
  customerEmail?: string,
  customerPhone: string,
  date: string,           // YYYY-MM-DD format
  time: string,           // HH:MM format
  numberOfGuests: number,
  status: "pending" | "confirmed" | "cancelled" | "completed",
  specialRequests?: string,
});

// Update reservation status
await reservationService.updateStatus(id, status);

// Cancel reservation (sets status to "cancelled")
await reservationService.cancel(id);

// Delete reservation
await reservationService.delete(id);
```

## Component Props

### Home

```typescript
interface HomeProps {
  addToCart: (item: { id: string; name: string; price: number }) => void;
}
```

### Menu

```typescript
interface MenuProps {
  addToCart: (item: { id: string; name: string; price: number }) => void;
}
```

### Cart

```typescript
interface CartProps {
  cart: Array<{ id: string; name: string; price: number; quantity: number }>;
  onUpdateQuantity: (id: string, quantity: number) => void; // RENAMED
  clearCart: () => void;
  onOrderComplete: () => void;
  userId?: string;
}
```

### Orders

```typescript
interface OrdersProps {
  userId?: string;
  userRole: string;
}
```

### Reservations

```typescript
interface ReservationsProps {
  userId?: string;
}
```

### AdminDashboard

```typescript
interface AdminDashboardProps {
  userId?: string;
  userRole: string;
}
```

## Data Flow Pattern Used

### Fetching Data

```typescript
const [data, setData] = useState<DataType[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceMethod();
      setData(result);
    } catch (err) {
      setError("Failed to load data");
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [dependencies]);
```

### Creating/Updating Data

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    await serviceMethod(data);
    toast.success("Operation successful!");
    // Refresh data or navigate
  } catch (error) {
    toast.error("Operation failed.");
    console.error(error);
  } finally {
    setIsSubmitting(false);
  }
};
```

## Important Notes

✅ **All components maintain:**

- Original UI styling and Tailwind classes
- Error handling and validation
- Loading and error states
- Toast notifications for user feedback
- Proper TypeScript typing

✅ **No breaking changes to:**

- Component hierarchy
- Navigation flow
- User interactions
- Form validations

✅ **Type Safety:**

- All Firebase service methods are fully typed
- Component props are properly typed
- No `any` types used in new code

## Differences from Convex Implementation

| Feature        | Convex             | Firebase                                |
| -------------- | ------------------ | --------------------------------------- |
| Query Hook     | `useQuery()`       | `useState()` + `useEffect()`            |
| Mutation Hook  | `useMutation()`    | `async/await` + `try/catch`             |
| Data Updates   | Automatic          | Manual refresh or callback              |
| Error Handling | Built-in to hooks  | Custom try/catch                        |
| Loading State  | Built-in undefined | Manual useState                         |
| Type IDs       | `Id<"collection">` | `string`                                |
| Timestamps     | `_creationTime`    | `Timestamp` (convert with `toMillis()`) |

---

## All Components are Production-Ready! ✅

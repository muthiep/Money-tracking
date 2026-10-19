'use client';
import { useParams } from 'next/navigation';
import TransactionForm from '@/components/TransactionForm';
export default function Page() {
  const { id } = useParams();
  return <TransactionForm mode="edit" id={id} />;
}

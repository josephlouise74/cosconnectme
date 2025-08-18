"use client"
// In pages/lender/products/create.js
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const CreateProductItemSection = dynamic(() => import('@/components/Lender/Costume/CreateCostumeItemSection'), {
  loading: () => <p>Loading form...</p>
});

export default function CreatePage() {
  return <div className='h-full m-8'>
    <Suspense>
      <CreateProductItemSection />
    </Suspense>
  </div>
}
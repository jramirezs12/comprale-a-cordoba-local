'use client';
import { use } from 'react';
import SellerDetailPageView from '../../../components/SellerDetail/SellerDetailPageView';

export default function SellerDetailPage({ params }) {
  const { id } = use(params);
  return <SellerDetailPageView id={id} />;
}
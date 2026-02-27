'use client';
import { use } from 'react';
import CategoryPageView from '../../../components/Category/CategoryPageView';

export default function CategoryPage({ params }) {
  const { id } = use(params);
  return <CategoryPageView id={id} />;
}
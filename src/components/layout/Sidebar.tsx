'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './Sidebar.css'

interface SidebarProps {
  role: 'Admin' | 'Seller' | 'Customer'
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const menuItems: Record<string, string[]> = {
    Admin: [
      'Home',
      'Address',
      'Bank List',
      'Bank Transfer Fee',
      'Cart',
      'Category',
      'Category Label',
      'Category Discount',
      'Cloud Service',
      'Current Event',
      'Daily Category Price',
      'Default Fee',
      'Discount',
      'Discount Sponsor',
      'Event Type',
      'Highlighted Product',
      'Notification Type',
      'Notifications',
      'Order Item',
      'Order Log',
      'Order Promo',
      'Order Shipping Status',
      'Order Shipping',

      'Sales',
    ],
    Seller: [
      'Home',
      // 'Address',
      'Bank Account',
      // 'Notification',
      'Products',
      'Sales'
    ],
    Customer: [
      'Home',
      'Address',
      'Cart',
      'Notification'
    ],
  };

  return (
  <aside className="sidebar">
    <Link href="/" className="sidebar-brand">
      <img src="/tokoaku.png" alt="tokoaku" />
    </Link>
    <div className="sidebar-content">
      <ul className="sidebar-list">
        {menuItems[role]?.map(label => {
          const path = `/dashboard/${label.toLowerCase().replace(/ /g, '-').replace(/_/g, '-')}`;
          const active = pathname === path || pathname.startsWith(path + '/');
          return (
            <li key={label}>
              <Link href={path} className={`sidebar-link ${active ? 'active' : ''}`}>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  </aside>
);
}

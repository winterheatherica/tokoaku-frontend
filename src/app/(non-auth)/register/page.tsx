'use client'

import RegisterForm from '@/components/auth/RegisterForm'
import './page.css'

export default function RegisterPage() {
  return (
    <div className="register-page">
      <div className="register-form-wrapper">
        <RegisterForm />
      </div>
    </div>
  )
}

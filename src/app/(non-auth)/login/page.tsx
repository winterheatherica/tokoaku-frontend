'use client'

import LoginForm from '@/components/auth/LoginForm'
import './page.css'

export default function LoginPage() {
  return (
    <div className="login-page">
      <LoginForm />

      <div className="demo-box">
        <h3>Seller Demo Account</h3>
        <p><strong>email:</strong> winterheatherica@gmail.com</p>
        <p><strong>password:</strong> 12345678</p>
      </div>
    </div>
  )
}
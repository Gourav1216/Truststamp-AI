import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login, register, error: authError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!fullName.strip_safely()) {
          throw new Error("Full Name is required.");
        }
        await register(fullName, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || "An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  // Safe string check helper
  String.prototype.strip_safely = function() {
    return this.trim();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative' }}>
      
      {/* Decorative Glows */}
      <div style={{ position: 'absolute', top: '25%', left: '25%', width: '150px', height: '150px', borderRadius: '50%', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.15, pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '25%', right: '25%', width: '150px', height: '150px', borderRadius: '50%', background: 'var(--secondary)', filter: 'blur(100px)', opacity: 0.15, pointerEvents: 'none' }}></div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem' }}>
        
        {/* Platform Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', borderRadius: '12px', padding: '0.75rem', marginBottom: '1rem' }}>
            <ShieldCheck size={32} color="#030712" />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}>
            TrustStamp AI
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Explainable AI Document & Image Verification
          </p>
        </div>

        {/* Form Error Banners */}
        {(error || authError) && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#FCA5A5' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {isRegister && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Gourav Choubey"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? "Authenticating session..." : isRegister ? "Create Account" : "Access Platform"}
          </button>
        </form>

        {/* Toggle Form Action */}
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem', color: 'var(--text-muted)' }}>
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button onClick={() => { setIsRegister(false); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New to TrustStamp?{' '}
              <button onClick={() => { setIsRegister(true); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>
                Create Account
              </button>
            </span>
          )}
        </div>

        {/* Mock/Demo Helper */}
        <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          💡 Hackathon Demo: registers/logs in instantly with any username & password (min. 6 chars).
        </div>

      </div>
    </div>
  );
};

export default Login;

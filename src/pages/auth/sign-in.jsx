import { Input, Button, Typography } from '@material-tailwind/react';
import { useState, useContext } from 'react';
import { login as loginService } from '../../services/users/login';
import { useAuth } from '@/context/loginContext';
import { useNavigate } from 'react-router-dom';
import CustomSwal from '@/utils/customSwal';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      const { user, token } = await loginService(email, password);
      login(user, token);

      navigate('/dashboard/home');
    } catch (error) {
      const status = error?.response?.status;

      if (status === 401) {
        CustomSwal.fire({
          icon: 'error',
          title: 'Invalid credentials',
          text: 'The email or password you entered is incorrect.',
        });
      } else {
        CustomSwal.fire({
          icon: 'error',
          title: 'Login failed',
          text: 'Something went wrong. Please try again later.',
        });
      }

      setLoading(false);
    }
  };

  return (
    <section
      className="flex min-h-screen items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/img/background_login.png')" }}
    >
      <div
        className="
    3xl:-translate-x-80 flex w-full max-w-md flex-col items-center gap-8
    px-4
    xl:-translate-x-56
    xl:items-start
    2xl:-translate-x-64
  "
      >
        {/* PATTERN */}
        <img
          src="/img/pattern.png"
          alt="Pattern"
          className="w-56 object-contain xl:w-64"
        />

        {/* LOGIN CARD */}
        <div className="w-full rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 text-left">
            <Typography variant="h3" className="font-bold">
              Sign In
            </Typography>
            <Typography
              variant="paragraph"
              color="blue-gray"
              className="mt-2 text-sm"
            >
              Enter your email and password
            </Typography>
          </div>

          {/* FORM */}
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div>
              <Typography className="mb-1 text-sm font-medium">
                <span className="text-red-500">*</span> Email
              </Typography>
              <Input
                size="lg"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Typography className="mb-1 text-sm font-medium">
                <span className="text-red-500">*</span> Password
              </Typography>
              <Input
                type="password"
                size="lg"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className={`mt-4 flex items-center justify-center gap-2 ${
                loading ? 'cursor-not-allowed opacity-80' : ''
              }`}
            >
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default SignIn;

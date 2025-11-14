import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const user = await loginUser(email, password);
        toast.success(`Welcome back, ${user.name}`);
        navigate("/dashboard");
      } else {
        await registerUser(name, email, password);
        toast.success("Account created successfully!");
        setIsLogin(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0e11] px-4 relative overflow-hidden">
      {/* background gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#9b5cff]/10 via-transparent to-[#e65cff]/10 blur-3xl"></div>

      <div
        className="w-full max-w-md bg-[#141418]/60 backdrop-blur-xl rounded-2xl p-8 border border-white/10 
        shadow-[0_0_25px_rgba(155,92,255,0.15)] transition-transform duration-500 hover:scale-[1.01]"
      >
        <h1 className="text-center text-4xl font-extrabold bg-gradient-to-r from-[#9b5cff] to-[#e65cff] bg-clip-text text-transparent">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-center text-muted-foreground mt-2">
          {isLogin
            ? "Log in to continue managing your finances."
            : "Join PennyPal and take control of your money."}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {!isLogin && (
            <div>
              <label className="text-sm font-medium text-gray-300">Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full mt-1 p-3 rounded-lg bg-[#1a1a20] text-white border border-white/10 
                focus:ring-2 focus:ring-[#9b5cff] outline-none"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 p-3 rounded-lg bg-[#1a1a20] text-white border border-white/10 
              focus:ring-2 focus:ring-[#9b5cff] outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 p-3 rounded-lg bg-[#1a1a20] text-white border border-white/10 
              focus:ring-2 focus:ring-[#e65cff] outline-none"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-lg font-semibold rounded-lg bg-gradient-to-r from-[#9b5cff] to-[#e65cff] 
            hover:opacity-90 transition-opacity text-white shadow-[0_0_20px_rgba(155,92,255,0.4)]"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            {isLogin ? "New here?" : "Already have an account?"}{" "}
            <span
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#e65cff] hover:text-[#9b5cff] font-semibold cursor-pointer transition-colors"
            >
              {isLogin ? "Create one" : "Login here"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}


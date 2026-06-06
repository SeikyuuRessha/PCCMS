import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "~/components/atoms";
import { loginWithEmail } from "../authService";

export function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("admin@pccms.vn");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!email.trim() || !password.trim()) {
            setError("Vui lòng nhập email và mật khẩu");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await loginWithEmail(email.trim(), password);
            navigate("/admin", { replace: true });
        } catch {
            setError("Đăng nhập thất bại. Vui lòng kiểm tra email hoặc mật khẩu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Đăng nhập</h1>
                <p className="mt-2 text-sm text-slate-500">
                    Truy cập dashboard bằng tài khoản hệ thống
                </p>
            </div>

            <div className="space-y-4">
                <Input
                    label="Email"
                    placeholder="admin@pccms.vn"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                />
                <Input
                    label="Mật khẩu"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                />
            </div>

            {error && <p className="text-sm font-medium text-error-600">{error}</p>}

            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                    <input type="checkbox" className="rounded border-slate-300" />
                    Ghi nhớ đăng nhập
                </label>
                <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="font-medium text-primary-700 transition hover:text-primary-800"
                >
                    Quên mật khẩu?
                </button>
            </div>

            <Button className="w-full py-3" variant="primary" type="submit" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            <p className="text-center text-sm text-slate-600">
                Chưa có tài khoản?{" "}
                <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="font-medium text-primary-700 hover:text-primary-800"
                >
                    Đăng ký ngay
                </button>
            </p>
        </form>
    );
}

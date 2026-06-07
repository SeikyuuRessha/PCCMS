import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button, Input } from "~/components/atoms";
import { loginWithEmail } from "../authService";

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const redirectTo =
        (location.state as { from?: string } | null)?.from ?? null;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const mutation = useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            login(data.token, data.refreshToken, data.user);
            toast.success("Đăng nhập thành công!");

            const role = data.user.roleCode.toLowerCase();
            const targetPath = ROUTES[role.toUpperCase() as keyof typeof ROUTES] || "/";
            if (typeof targetPath === "object" && targetPath.DASHBOARD) {
                navigate(targetPath.DASHBOARD);
            } else if (typeof targetPath === "string") {
                navigate(targetPath);
            } else {
                navigate(ROUTES.HOME);
            }
        },
        onError: (error) => {
            toast.error(parseApiError(error));
        },
    });

    const onSubmit = (data: LoginFormData) => {
        mutation.mutate(data);
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
                <div>
                    <Input
                        id="email"
                        label="Email"
                        placeholder="nhap@email.com"
                        {...register("email")}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                    )}
                </div>
                <div>
                    <Input
                        id="password"
                        label="Mật khẩu"
                        type="password"
                        placeholder="••••••••"
                        {...register("password")}
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                    )}
                </div>
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
            <Button
                type="submit"
                className="w-full py-3"
                variant="primary"
                disabled={mutation.isPending}
            >
                {mutation.isPending ? "Đang xử lý..." : "Đăng nhập"}
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

import { useNavigate } from "react-router-dom";
import { Button, Input } from "~/components/atoms";

export function RegisterPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const mutation = useMutation({
        mutationFn: authApi.register,
        onSuccess: (data) => {
            login(data.token, data.refreshToken, data.user);
            toast.success("Đăng ký tài khoản thành công!");

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

    const onSubmit = (data: RegisterFormData) => {
        mutation.mutate(data);
    };

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Tạo tài khoản chủ nuôi</h1>
                <p className="mt-2 text-sm text-slate-500">
                    Bắt đầu quản lý hồ sơ thú cưng và đặt dịch vụ trực tuyến
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <Input
                        id="fullName"
                        label="Họ tên"
                        placeholder="Nguyễn Văn A"
                        {...register("fullName")}
                    />
                    {errors.fullName && (
                        <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
                    )}
                </div>
                <div>
                    <Input
                        id="email"
                        label="Email"
                        placeholder="owner@email.com"
                        {...register("email")}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                    )}
                </div>
            </div>
            <Input label="Email" placeholder="owner@email.com" />
            <div className="grid gap-4 md:grid-cols-2">
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
                <div>
                    <Input
                        id="confirmPassword"
                        label="Xác nhận mật khẩu"
                        type="password"
                        placeholder="••••••••"
                        {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>
            </div>

            <Button
                type="submit"
                className="w-full py-3"
                variant="primary"
                disabled={mutation.isPending}
            >
                {mutation.isPending ? "Đang xử lý..." : "Tạo tài khoản"}
            </Button>

            <p className="text-center text-sm text-slate-600">
                Đã có tài khoản?{" "}
                <button
                    onClick={() => navigate("/login")}
                    className="font-medium text-primary-700 hover:text-primary-800"
                >
                    Về trang đăng nhập
                </button>
            </p>
        </div>
    );
}

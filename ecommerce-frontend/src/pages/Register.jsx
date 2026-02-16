import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../redux/slices/auth.slice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const Register = () => {
  const { t } = useTranslation("auth");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert(t("passwordsDoNotMatch"));
      return;
    }

    const { confirmPassword, ...userData } = formData;

    try {
      await dispatch(register(userData)).unwrap();
      navigate("/");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative w-full max-w-5xl">
        <div className="absolute -top-12 left-10 h-32 w-32 rounded-full bg-primary-100 blur-3xl opacity-70" />
        <div className="absolute -bottom-12 right-8 h-40 w-40 rounded-full bg-indigo-100 blur-3xl opacity-70" />
        <div className="relative grid gap-8 overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur md:grid-cols-[1fr_1.05fr] md:p-10">
          <div className="hidden flex-col justify-between rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-8 text-white shadow-lg md:flex">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
                {t("createAccount")}
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">
                {t("joinMarketplace")}
              </h2>
              <p className="mt-4 text-sm text-white/70">{t("enjoyBenefits")}</p>
            </div>
            <div className="space-y-3 text-sm text-white/80">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
                {t("benefitShipping")}
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
                {t("benefitReturns")}
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
                {t("benefitEarlyAccess")}
              </div>
            </div>
          </div>

          <div className="space-y-8 rounded-2xl bg-white/90 p-6 shadow-xl md:p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                {t("createYourAccount")}
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {t("or")}{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  {t("signInExisting")}
                </Link>
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {t("fullName")}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500"
                    placeholder={t("fullNamePlaceholder")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {t("email")}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500"
                    placeholder={t("emailPlaceholder")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {t("phoneNumber")}
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500"
                    placeholder={t("phonePlaceholder")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {t("address")}
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500"
                    placeholder={t("addressPlaceholder")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {t("password")}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength="6"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500"
                      placeholder={t("passwordPlaceholder")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-5 w-5" />
                      ) : (
                        <FaEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {t("confirmPassword")}
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500"
                    placeholder={t("confirmPasswordPlaceholder")}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500 focus:ring-opacity-50 disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
                >
                  {loading ? t("creatingAccount") : t("createAccountButton")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

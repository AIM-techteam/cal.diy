"use client";

import { ErrorCode } from "@calcom/features/auth/lib/ErrorCode";
import { HOSTED_CAL_FEATURES, WEBAPP_URL, WEBSITE_URL } from "@calcom/lib/constants";
import { emailRegex } from "@calcom/lib/emailSchema";
import { getSafeRedirectUrl } from "@calcom/lib/getSafeRedirectUrl";
import { useCompatSearchParams } from "@calcom/lib/hooks/useCompatSearchParams";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Alert } from "@calcom/ui/components/alert";
import { Icon } from "@calcom/ui/components/icon";
import { LastUsed, useLastUsed } from "@calcom/web/modules/auth/hooks/useLastUsed";
import AddToHomescreen from "@components/AddToHomescreen";
import BackupCode from "@components/auth/BackupCode";
import TwoFactor from "@components/auth/TwoFactor";
import { Button } from "@coss/ui/components/button";
import { Field, FieldLabel } from "@coss/ui/components/field";
import { Input } from "@coss/ui/components/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@coss/ui/components/input-group";
import { Separator } from "@coss/ui/components/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import type { inferSSRProps } from "@lib/types/inferSSRProps";
import type { getServerSideProps } from "@server/lib/auth/login/getServerSideProps";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { AimBrandScope } from "@components/aim/AimBrandScope";
import { AimLoginRoute } from "@components/aim/AimLoginRoute";
import { AimLogo } from "@components/aim/AimLogo";

interface LoginValues {
  email: string;
  password: string;
  totpCode: string;
  backupCode: string;
  csrfToken: string;
}

const MicrosoftIcon = () => (
  <img className="size-4" src="/microsoft-logo.svg" alt="" />
);

const GoogleIcon = () => (
  <img className="size-4" src="/google-icon-colored.svg" alt="" />
);

export type PageProps = inferSSRProps<typeof getServerSideProps>;
export default function Login({
  csrfToken,
  isGoogleLoginEnabled,
  isOutlookLoginEnabled,
  totpEmail,
}: PageProps) {
  const searchParams = useCompatSearchParams();
  const { t } = useLocale();
  const router = useRouter();
  const formSchema = z
    .object({
      email: z
        .string()
        .min(1, `${t("error_required_field")}`)
        .regex(emailRegex, `${t("enter_valid_email")}`),
      ...(totpEmail ? {} : { password: z.string().min(1, `${t("error_required_field")}`) }),
    })
    // Passthrough other fields like totpCode
    .passthrough();
  const methods = useForm<LoginValues>({ resolver: zodResolver(formSchema) });
  const { register, formState } = methods;
  const [twoFactorRequired, setTwoFactorRequired] = useState(!!totpEmail || false);
  const [twoFactorLostAccess, setTwoFactorLostAccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUsed, setLastUsed] = useLastUsed();
  const [showPassword, setShowPassword] = useState(false);

  const errorMessages: { [key: string]: string } = {
    // [ErrorCode.SecondFactorRequired]: t("2fa_enabled_instructions"),
    // Don't leak information about whether an email is registered or not
    [ErrorCode.IncorrectEmailPassword]: t("incorrect_email_password"),
    [ErrorCode.IncorrectTwoFactorCode]: `${t("incorrect_2fa_code")} ${t("please_try_again")}`,
    [ErrorCode.InternalServerError]: `${t("something_went_wrong")} ${t("please_try_again_and_contact_us")}`,
    [ErrorCode.ThirdPartyIdentityProviderEnabled]: t("account_created_with_identity_provider"),
  };

  let callbackUrl = searchParams?.get("callbackUrl") || "";

  if (/"\//.test(callbackUrl)) callbackUrl = callbackUrl.substring(1);

  // If not absolute URL, make it absolute
  if (!/^https?:\/\//.test(callbackUrl)) {
    callbackUrl = `${WEBAPP_URL}/${callbackUrl}`;
  }

  const safeCallbackUrl = getSafeRedirectUrl(callbackUrl);

  callbackUrl = safeCallbackUrl || "";

  const onSubmit = async (values: LoginValues) => {
    setErrorMessage(null);
    // telemetry.event(telemetryEventTypes.login, collectPageParameters());
    const res = await signIn<"credentials">("credentials", {
      ...values,
      callbackUrl,
      redirect: false,
    });
    if (!res) setErrorMessage(errorMessages[ErrorCode.InternalServerError]);
    // we're logged in! let's do a hard refresh to the desired url
    else if (!res.error) {
      setLastUsed("credentials");
      router.push(callbackUrl);
    } else if (res.error === ErrorCode.SecondFactorRequired) setTwoFactorRequired(true);
    else if (res.error === ErrorCode.IncorrectBackupCode) setErrorMessage(t("incorrect_backup_code"));
    else if (res.error === ErrorCode.MissingBackupCodes) setErrorMessage(t("missing_backup_codes"));
    // fallback if error not found
    else setErrorMessage(errorMessages[res.error] || t("something_went_wrong"));
  };

  const showSocialLogin = isGoogleLoginEnabled || isOutlookLoginEnabled;
  // AIM: accounts are provisioned by ops (onboard-advisors.js); nobody signs up from here.
  const showSignupLink = false;

  return (
    <div className="bg-default grid min-h-dvh grid-rows-[auto_1fr] lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:grid-rows-1">
      <AimBrandScope />

      <aside className="aim-rail bg-cal-muted flex flex-col gap-6 px-5 pt-6 pb-5 sm:px-8 lg:min-h-dvh lg:gap-0 lg:px-14 lg:py-14 xl:px-16">
        <AimLogo variant="light" className="h-6 w-auto self-start lg:h-7" />
        <h2 className="font-cal text-emphasis mt-16 mb-12 hidden max-w-[28rem] text-5xl leading-[1.08] text-balance lg:block">
          {t("aim_login_route_heading")}
        </h2>
        <AimLoginRoute currentIndex={0} />
        <p className="text-muted mt-auto hidden pt-12 text-sm lg:block">{t("aim_login_help")}</p>
      </aside>

      <main className="flex items-start justify-center px-5 pt-10 pb-12 sm:px-8 sm:pt-14 lg:items-center lg:px-12 lg:py-14">
        <div className="w-full max-w-[440px]">
          <h1 className="font-cal text-emphasis text-4xl leading-[1.05] sm:text-5xl">
            {t("aim_advisor_sign_in")}
          </h1>

          <p className="text-subtle mt-3 mb-8 text-base" data-testid="login-subtitle">
            {twoFactorRequired ? t("2fa_code") : t("aim_login_subtitle")}
          </p>

          <FormProvider {...methods}>
            {/* Social Login Buttons */}
            {!twoFactorRequired && showSocialLogin && (
              <>
                <div className="flex flex-col gap-2">
                  {isGoogleLoginEnabled && (
                    <Button
                      className="h-12 w-full text-base sm:h-12"
                      disabled={formState.isSubmitting}
                      data-testid="google"
                      onClick={async (e) => {
                        e.preventDefault();
                        setLastUsed("google");
                        await signIn("google", {
                          callbackUrl,
                        });
                      }}>
                      <GoogleIcon />
                      <span>{t("signin_with_google")}</span>
                      {lastUsed === "google" && <LastUsed />}
                    </Button>
                  )}
                  {isOutlookLoginEnabled && (
                    <Button
                      variant="outline"
                      className="w-full py-1"
                      data-testid="microsoft"
                      onClick={async (e) => {
                        e.preventDefault();
                        setLastUsed("microsoft");
                        await signIn("azure-ad", {
                          callbackUrl,
                        });
                      }}>
                      <MicrosoftIcon />
                      <span>{t("signin_with_microsoft")}</span>
                      {lastUsed === "microsoft" && <LastUsed />}
                    </Button>
                  )}
                </div>

                {/* Advisors sign in with Google; the email form below is for AIM staff. */}
                <div className="my-7 flex items-center gap-4">
                  <Separator className="flex-1" />
                  <span className="text-muted text-sm">{t("aim_login_staff_divider")}</span>
                  <Separator className="flex-1" />
                </div>
              </>
            )}

            <form onSubmit={methods.handleSubmit(onSubmit)} noValidate data-testid="login-form">
              <input defaultValue={csrfToken || undefined} type="hidden" hidden {...register("csrfToken")} />

              {!twoFactorRequired && (
                <div className="space-y-6">
                  {/* Email Field */}
                  <Field>
                    <FieldLabel>{t("email")}</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={totpEmail || (searchParams?.get("email") as string)}
                      autoComplete="email"
                      {...register("email")}
                    />
                    {formState.errors.email && (
                      <p data-testid="field-error" className="text-destructive-foreground text-xs">
                        {formState.errors.email.message}
                      </p>
                    )}
                  </Field>

                  {/* Password Field */}
                  <Field>
                    <div className="flex w-full items-center justify-between">
                      <FieldLabel>{t("password")}</FieldLabel>
                      <Link href="/auth/forgot-password" className="text-sm text-subtle hover:text-emphasis">
                        {t("forgot")}
                      </Link>
                    </div>
                    <InputGroup className="overflow-hidden">
                      <InputGroupInput
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        {...register("password")}
                      />
                      <InputGroupAddon align="inline-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? t("hide_password") : t("show_password")}>
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                    {formState.errors.password && (
                      <p data-testid="field-error" className="text-destructive-foreground text-xs">
                        {formState.errors.password.message}
                      </p>
                    )}
                  </Field>
                </div>
              )}

              {/* Two Factor */}
              {twoFactorRequired && (
                <div className="space-y-4">
                  {!twoFactorLostAccess ? <TwoFactor center /> : <BackupCode center />}
                </div>
              )}

              {/* Error Message */}
              {errorMessage && <Alert severity="error" title={errorMessage} className="mt-4" />}

              {/* Submit Button */}
              <Button
                type="submit"
                variant={showSocialLogin && !twoFactorRequired ? "outline" : "default"}
                className="mt-8 h-11 w-full sm:h-11"
                disabled={formState.isSubmitting}>
                {twoFactorRequired ? t("submit") : t("continue")}
              </Button>
            </form>

            {/* Two Factor Footer */}
            {twoFactorRequired && (
              <div className="mt-4 flex justify-center gap-4">
                {!totpEmail ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (twoFactorLostAccess) {
                          setTwoFactorLostAccess(false);
                          methods.setValue("backupCode", "");
                        } else {
                          setTwoFactorRequired(false);
                          methods.setValue("totpCode", "");
                        }
                        setErrorMessage(null);
                      }}>
                      <Icon name="arrow-left" className="mr-2 size-4" />
                      {t("go_back")}
                    </Button>
                    {!twoFactorLostAccess && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setTwoFactorLostAccess(true);
                          setErrorMessage(null);
                          methods.setValue("totpCode", "");
                        }}>
                        <Icon name="lock" className="mr-2 size-4" />
                        {t("lost_access")}
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      window.location.replace("/");
                    }}>
                    {t("cancel")}
                  </Button>
                )}
              </div>
            )}
          </FormProvider>

          <p className="text-subtle mt-10 text-sm lg:hidden">{t("aim_login_help")}</p>

          {!twoFactorRequired && showSignupLink && (
            <div className="mt-6 flex items-center justify-center gap-4 text-center">
              <Link
                href={
                  callbackUrl
                    ? `${WEBSITE_URL}/signup?redirect=${encodeURIComponent(callbackUrl)}`
                    : `${WEBSITE_URL}/signup`
                }
                className="text-sm font-medium text-emphasis hover:underline">
                {t("create_account")}
              </Link>
            </div>
          )}
        </div>
      </main>

      <AddToHomescreen />
    </div>
  );
}

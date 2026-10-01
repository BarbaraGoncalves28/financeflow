import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Check, TrendingUp } from "lucide-react-native";
import { useRouter } from "expo-router";

import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { api } from "../../src/services/api";
import {
  colors,
  radii,
  typography,
} from "../../src/theme/design-system";

type AuthMode = "login" | "register" | "forgot";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { user } = response.data;

      console.log("Login efetuado:", user?.name);

      router.replace("/(panel)");
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "E-mail ou senha inválidos."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    setErrorMessage("");

    if (!name || !email || !password) {
      setErrorMessage("Preencha todos os campos.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/register", {
        name,
        email,
        password,
      });

      setMode("login");
      setPassword("");
      setErrorMessage("");
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Erro ao criar conta. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot() {
    setErrorMessage("");

    if (!email) {
      setErrorMessage("Informe seu e-mail.");
      return;
    }

    /*
     * O fluxo visual do protótipo já está pronto.
     *
     * A integração do endpoint específico de recuperação
     * será conectada quando fecharmos o módulo de recovery
     * do backend.
     */
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setForgotSent(true);
    }, 1000);
  }

  function handlePrimaryAction() {
    if (mode === "login") {
      handleSubmit();
      return;
    }

    if (mode === "register") {
      handleRegister();
      return;
    }

    handleForgot();
  }

  function handleBackToLogin() {
    setMode("login");
    setForgotSent(false);
    setErrorMessage("");
  }

  const title =
    mode === "login"
      ? "Bem-vindo de volta"
      : mode === "register"
        ? "Criar conta"
        : "Recuperar senha";

  const subtitle =
    mode === "login"
      ? "Acesse sua conta para continuar"
      : mode === "register"
        ? "Comece a controlar suas finanças"
        : "Enviaremos um link para seu e-mail";

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.purpleGlow} />
        <View style={styles.greenGlow} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* LOGO */}
            <View style={styles.logoSection}>
              <View style={styles.brandRow}>
                <LinearGradient
                  colors={["#7C6AF7", "#5B8AF7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logo}
                >
                  <TrendingUp
                    size={24}
                    color="#FFFFFF"
                    strokeWidth={2.5}
                  />
                </LinearGradient>

                <View>
                  <Text style={styles.brandName}>FinanceFlow</Text>

                  <Text style={styles.brandSubtitle}>
                    Controle financeiro inteligente
                  </Text>
                </View>
              </View>
            </View>

            {/* TÍTULO */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>{title}</Text>

              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            {/* RECOVERY SUCCESS */}
            {forgotSent ? (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Check
                    size={36}
                    color={colors.success}
                    strokeWidth={2.5}
                  />
                </View>

                <Text style={styles.successTitle}>
                  E-mail enviado!
                </Text>

                <Text style={styles.successDescription}>
                  Verifique sua caixa de entrada e siga as instruções
                  para redefinir sua senha.
                </Text>

                <Pressable onPress={handleBackToLogin}>
                  <Text style={styles.link}>
                    Voltar para o login
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.formContainer}>
                <View style={styles.fields}>
                  {mode === "register" && (
                    <Input
                      label="Seu nome"
                      placeholder="Bárbara Oliveira"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  )}

                  <Input
                    label="E-mail"
                    placeholder="barbara@email.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  {mode !== "forgot" && (
                    <Input
                      label="Senha"
                      placeholder="••••••••"
                      value={password}
                      onChangeText={setPassword}
                      secure
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  )}
                </View>

                {/* ERRO */}
                {errorMessage ? (
                  <Text style={styles.errorText}>
                    {errorMessage}
                  </Text>
                ) : null}

                {/* ESQUECI A SENHA */}
                {mode === "login" && (
                  <Pressable
                    onPress={() => {
                      setMode("forgot");
                      setErrorMessage("");
                    }}
                    style={styles.forgotButton}
                  >
                    <Text style={styles.linkSmall}>
                      Esqueci minha senha
                    </Text>
                  </Pressable>
                )}

                {/* BOTÃO PRINCIPAL */}
                <Button
                  title={
                    mode === "login"
                      ? "Entrar"
                      : mode === "register"
                        ? "Criar conta"
                        : "Enviar link"
                  }
                  loading={loading}
                  onPress={handlePrimaryAction}
                  style={styles.primaryButton}
                />

                {/* TOGGLE */}
                <View style={styles.toggleContainer}>
                  {mode === "login" ? (
                    <Text style={styles.toggleText}>
                      Não tem conta?{" "}
                      <Text
                        onPress={() => {
                          setMode("register");
                          setErrorMessage("");
                        }}
                        style={styles.toggleLink}
                      >
                        Criar agora
                      </Text>
                    </Text>
                  ) : mode === "register" ? (
                    <Text style={styles.toggleText}>
                      Já tem conta?{" "}
                      <Text
                        onPress={() => {
                          setMode("login");
                          setErrorMessage("");
                        }}
                        style={styles.toggleLink}
                      >
                        Entrar
                      </Text>
                    </Text>
                  ) : (
                    <Pressable onPress={handleBackToLogin}>
                      <Text style={styles.toggleLink}>
                        ← Voltar para o login
                      </Text>
                    </Pressable>
                  )}
                </View>

                {/* SEGURANÇA */}
                {mode !== "forgot" && (
                  <View style={styles.securitySection}>
                    <View style={styles.securityDivider}>
                      <View style={styles.divider} />

                      <Text style={styles.securityLabel}>
                        Plataforma segura
                      </Text>

                      <View style={styles.divider} />
                    </View>

                    <View style={styles.securityItems}>
                      <Text style={styles.securityItem}>
                        🔐 JWT
                      </Text>

                      <Text style={styles.securityItem}>
                        🛡️ HTTPS
                      </Text>

                      <Text style={styles.securityItem}>
                        🔒 bcrypt
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    flexGrow: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
  },

  purpleGlow: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    top: -100,
    right: -100,
    backgroundColor: "rgba(124,106,247,0.12)",
  },

  greenGlow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    bottom: 200,
    left: -50,
    backgroundColor: "rgba(0,201,167,0.08)",
  },

  logoSection: {
    marginBottom: 40,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  logo: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  brandName: {
    color: colors.text,
    fontFamily: typography.fontFamily.extraBold,
    fontSize: typography.fontSize["2xl"],
  },

  brandSubtitle: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    marginTop: 1,
  },

  titleSection: {
    marginBottom: 32,
  },

  title: {
    color: colors.text,
    fontFamily: typography.fontFamily.extraBold,
    fontSize: typography.fontSize["3xl"],
    lineHeight: 36,
    marginBottom: 6,
  },

  subtitle: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },

  formContainer: {
    flex: 1,
  },

  fields: {
    gap: 12,
  },

  errorText: {
    color: colors.danger,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    marginTop: 10,
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: 20,
    marginBottom: 24,
  },

  linkSmall: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
  },

  primaryButton: {
    marginBottom: 24,
  },

  toggleContainer: {
    alignItems: "center",
  },

  toggleText: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
  },

  toggleLink: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.sm,
  },

  securitySection: {
    marginTop: "auto",
    paddingTop: 32,
  },

  securityDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(139,156,200,0.15)",
  },

  securityLabel: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
  },

  securityItems: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },

  securityItem: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
  },

  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
  },

  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(0,201,167,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  successTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    marginBottom: 8,
  },

  successDescription: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 32,
  },

  link: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
  },
});
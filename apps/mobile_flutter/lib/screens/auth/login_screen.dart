<<<<<<< HEAD
=======
// Login Screen
>>>>>>> origin
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
<<<<<<< HEAD
  final _emailController = TextEditingController(text: 'sv@fpt.edu.vn');
  final _passwordController = TextEditingController(text: '123456789');

  bool _obscurePassword = true;
  bool _rememberMe = false;
=======
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
>>>>>>> origin
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
<<<<<<< HEAD
    FocusScope.of(context).unfocus();

    setState(() {
      _error = null;
    });

    if (_emailController.text.trim().isEmpty ||
        _passwordController.text.trim().isEmpty) {
      setState(() {
        _error = 'Vui lòng nhập đầy đủ email và mật khẩu.';
      });
      return;
    }

    final authProvider = Provider.of<AuthProvider>(context, listen: false);

=======
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
>>>>>>> origin
    final result = await authProvider.login(
      _emailController.text.trim(),
      _passwordController.text,
    );

    if (!mounted) return;

    if (result['success'] == true) {
      final user = authProvider.user;
      if (user != null) {
        if (user.isStudent) {
          context.go('/student');
        } else if (user.isLecturer) {
          context.go('/lecturer');
        } else if (user.isAdmin) {
          context.go('/admin');
        }
      }
    } else {
      setState(() {
<<<<<<< HEAD
        _error = (result['error'] as String?) ?? 'Đăng nhập thất bại.';
=======
        _error = result['error'] as String;
>>>>>>> origin
      });
    }
  }

<<<<<<< HEAD
  void _fillDemo(String email, String password) {
    setState(() {
      _emailController.text = email;
      _passwordController.text = password;
      _error = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final size = MediaQuery.of(context).size;
    final isMobile = size.width < 900;

    return Scaffold(
      body: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        behavior: HitTestBehavior.opaque,
        child: Container(
          width: double.infinity,
          height: double.infinity,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              colors: [
                Color(0xFFBFEDE3),
                Color(0xFFD9F2F6),
              ],
            ),
          ),
          child: SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: ConstrainedBox(
                  constraints: BoxConstraints(
                    maxWidth: isMobile ? 520 : 980,
                  ),
                  child: Container(
                    width: double.infinity,
                    height: isMobile ? null : 700,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEAF3F2),
                      borderRadius: BorderRadius.circular(32),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.12),
                          blurRadius: 32,
                          offset: const Offset(0, 18),
                        ),
                      ],
                    ),
                    child: isMobile
                        ? _MobileLayout(
                            emailController: _emailController,
                            passwordController: _passwordController,
                            obscurePassword: _obscurePassword,
                            rememberMe: _rememberMe,
                            error: _error,
                            isLoading: authProvider.isLoading,
                            onTogglePassword: () {
                              setState(() {
                                _obscurePassword = !_obscurePassword;
                              });
                            },
                            onRememberChanged: (value) {
                              setState(() {
                                _rememberMe = value;
                              });
                            },
                            onLogin: _handleLogin,
                            onForgotPassword: () =>
                                context.go('/forgot-password'),
                            onDemoTap: _fillDemo,
                          )
                        : Row(
                            children: [
                              Expanded(
                                flex: 11,
                                child: _DesktopFormPanel(
                                  emailController: _emailController,
                                  passwordController: _passwordController,
                                  obscurePassword: _obscurePassword,
                                  rememberMe: _rememberMe,
                                  error: _error,
                                  isLoading: authProvider.isLoading,
                                  onTogglePassword: () {
                                    setState(() {
                                      _obscurePassword = !_obscurePassword;
                                    });
                                  },
                                  onRememberChanged: (value) {
                                    setState(() {
                                      _rememberMe = value;
                                    });
                                  },
                                  onLogin: _handleLogin,
                                  onForgotPassword: () =>
                                      context.go('/forgot-password'),
                                  onDemoTap: _fillDemo,
                                ),
                              ),
                              const SizedBox(width: 18),
                              const Expanded(
                                flex: 10,
                                child: _BrandPanel(),
                              ),
                            ],
                          ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _MobileLayout extends StatelessWidget {
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final bool obscurePassword;
  final bool rememberMe;
  final String? error;
  final bool isLoading;
  final VoidCallback onTogglePassword;
  final ValueChanged<bool> onRememberChanged;
  final VoidCallback onLogin;
  final VoidCallback onForgotPassword;
  final void Function(String email, String password) onDemoTap;

  const _MobileLayout({
    required this.emailController,
    required this.passwordController,
    required this.obscurePassword,
    required this.rememberMe,
    required this.error,
    required this.isLoading,
    required this.onTogglePassword,
    required this.onRememberChanged,
    required this.onLogin,
    required this.onForgotPassword,
    required this.onDemoTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _LogoHeader(),
          const SizedBox(height: 24),
          const _MiniBrandBlock(),
          const SizedBox(height: 28),
          _FormSection(
            emailController: emailController,
            passwordController: passwordController,
            obscurePassword: obscurePassword,
            rememberMe: rememberMe,
            error: error,
            isLoading: isLoading,
            onTogglePassword: onTogglePassword,
            onRememberChanged: onRememberChanged,
            onLogin: onLogin,
            onForgotPassword: onForgotPassword,
            onDemoTap: onDemoTap,
          ),
        ],
      ),
    );
  }
}

class _DesktopFormPanel extends StatelessWidget {
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final bool obscurePassword;
  final bool rememberMe;
  final String? error;
  final bool isLoading;
  final VoidCallback onTogglePassword;
  final ValueChanged<bool> onRememberChanged;
  final VoidCallback onLogin;
  final VoidCallback onForgotPassword;
  final void Function(String email, String password) onDemoTap;

  const _DesktopFormPanel({
    required this.emailController,
    required this.passwordController,
    required this.obscurePassword,
    required this.rememberMe,
    required this.error,
    required this.isLoading,
    required this.onTogglePassword,
    required this.onRememberChanged,
    required this.onLogin,
    required this.onForgotPassword,
    required this.onDemoTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(42, 34, 42, 34),
      child: Align(
        alignment: Alignment.centerLeft,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 430),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const _LogoHeader(),
              const SizedBox(height: 40),
              _FormSection(
                emailController: emailController,
                passwordController: passwordController,
                obscurePassword: obscurePassword,
                rememberMe: rememberMe,
                error: error,
                isLoading: isLoading,
                onTogglePassword: onTogglePassword,
                onRememberChanged: onRememberChanged,
                onLogin: onLogin,
                onForgotPassword: onForgotPassword,
                onDemoTap: onDemoTap,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LogoHeader extends StatelessWidget {
  const _LogoHeader();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 46,
          height: 46,
          decoration: BoxDecoration(
            color: const Color(0xFFF4FBFA),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFBFE5DE)),
          ),
          child: const Icon(
            Icons.menu_book_outlined,
            color: Color(0xFF0C5F5D),
            size: 23,
          ),
        ),
        const SizedBox(width: 14),
        const Text(
          'Devora',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: Color(0xFF114E4D),
          ),
        ),
      ],
    );
  }
}

class _FormSection extends StatelessWidget {
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final bool obscurePassword;
  final bool rememberMe;
  final String? error;
  final bool isLoading;
  final VoidCallback onTogglePassword;
  final ValueChanged<bool> onRememberChanged;
  final VoidCallback onLogin;
  final VoidCallback onForgotPassword;
  final void Function(String email, String password) onDemoTap;

  const _FormSection({
    required this.emailController,
    required this.passwordController,
    required this.obscurePassword,
    required this.rememberMe,
    required this.error,
    required this.isLoading,
    required this.onTogglePassword,
    required this.onRememberChanged,
    required this.onLogin,
    required this.onForgotPassword,
    required this.onDemoTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Chào mừng',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w800,
            color: Color(0xFF1F2937),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Vui lòng nhập thông tin tài khoản của bạn',
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey.shade600,
            height: 1.5,
          ),
        ),
        const SizedBox(height: 28),

        const _FieldLabel('Email'),
        const SizedBox(height: 8),
        _RoundedInput(
          controller: emailController,
          hintText: 'sv@fpt.edu.vn',
          obscure: false,
          keyboardType: TextInputType.emailAddress,
          prefixIcon: Icons.email_outlined,
        ),

        const SizedBox(height: 18),
        const _FieldLabel('Mật khẩu'),
        const SizedBox(height: 8),
        _RoundedInput(
          controller: passwordController,
          hintText: '••••••••••',
          obscure: obscurePassword,
          keyboardType: TextInputType.visiblePassword,
          prefixIcon: Icons.lock_outline,
          suffixIcon: IconButton(
            onPressed: onTogglePassword,
            splashRadius: 20,
            icon: Icon(
              obscurePassword
                  ? Icons.visibility_outlined
                  : Icons.visibility_off_outlined,
              color: const Color(0xFF6B7280),
            ),
          ),
        ),

        const SizedBox(height: 14),
        Row(
          children: [
            InkWell(
              borderRadius: BorderRadius.circular(8),
              onTap: () => onRememberChanged(!rememberMe),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    width: 24,
                    height: 24,
                    child: Checkbox(
                      value: rememberMe,
                      onChanged: (value) =>
                          onRememberChanged(value ?? false),
                      activeColor: const Color(0xFF11998E),
                      side: const BorderSide(color: Color(0xFF97AAA8)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  const Text(
                    'Duy trì đăng nhập',
                    style: TextStyle(
                      fontSize: 14,
                      color: Color(0xFF5B6665),
                    ),
                  ),
                ],
              ),
            ),
            const Spacer(),
            TextButton(
              onPressed: onForgotPassword,
              style: TextButton.styleFrom(
                foregroundColor: const Color(0xFF10998F),
                padding:
                    const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
                minimumSize: const Size(20, 20),
              ),
              child: const Text(
                'Quên mật khẩu?',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
        ),

        if (error != null) ...[
          const SizedBox(height: 18),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF1F2),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFFDA4AF)),
            ),
            child: Text(
              error!,
              style: const TextStyle(
                color: Color(0xFFBE123C),
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ],

        const SizedBox(height: 18),
        SizedBox(
          width: double.infinity,
          height: 54,
          child: ElevatedButton(
            onPressed: isLoading ? null : onLogin,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF129D93),
              foregroundColor: Colors.white,
              elevation: 6,
              shadowColor: const Color(0xFF129D93).withOpacity(0.35),
              disabledBackgroundColor: const Color(0xFF8DCFC8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Text(
                    'Đăng nhập',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
          ),
        ),

        const SizedBox(height: 24),
        Row(
          children: [
            Expanded(
              child: Divider(
                color: Colors.grey.shade300,
                thickness: 1,
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              child: Text(
                'ĐĂNG NHẬP NHANH',
                style: TextStyle(
                  fontSize: 12,
                  letterSpacing: 0.8,
                  fontWeight: FontWeight.w700,
                  color: Colors.grey.shade500,
                ),
              ),
            ),
            Expanded(
              child: Divider(
                color: Colors.grey.shade300,
                thickness: 1,
              ),
            ),
          ],
        ),

        const SizedBox(height: 18),
        const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _QuickActionIcon(icon: Icons.shield_outlined),
            SizedBox(width: 18),
            _QuickActionIcon(icon: Icons.menu_book_outlined),
            SizedBox(width: 18),
            _QuickActionIcon(icon: Icons.school_outlined),
          ],
        ),

        const SizedBox(height: 26),
        _DemoAccountsCard(onDemoTap: onDemoTap),
      ],
    );
  }
}

class _FieldLabel extends StatelessWidget {
  final String text;

  const _FieldLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: Color(0xFF394544),
      ),
    );
  }
}

class _RoundedInput extends StatelessWidget {
  final TextEditingController controller;
  final String hintText;
  final bool obscure;
  final TextInputType keyboardType;
  final IconData? prefixIcon;
  final Widget? suffixIcon;

  const _RoundedInput({
    required this.controller,
    required this.hintText,
    required this.obscure,
    required this.keyboardType,
    this.prefixIcon,
    this.suffixIcon,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      keyboardType: keyboardType,
      style: const TextStyle(
        fontSize: 15,
        color: Color(0xFF111827),
      ),
      decoration: InputDecoration(
        hintText: hintText,
        hintStyle: TextStyle(
          color: Colors.grey.shade600,
          fontSize: 15,
        ),
        prefixIcon: prefixIcon != null
            ? Icon(prefixIcon, color: const Color(0xFF7B8794))
            : null,
        suffixIcon: suffixIcon,
        filled: true,
        fillColor: const Color(0xFFE7ECF6),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 18,
          vertical: 18,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(26),
          borderSide: const BorderSide(color: Color(0xFFDDE5F0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(26),
          borderSide: const BorderSide(color: Color(0xFFDDE5F0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(26),
          borderSide: const BorderSide(
            color: Color(0xFF89CFC6),
            width: 1.4,
          ),
        ),
      ),
    );
  }
}

class _QuickActionIcon extends StatelessWidget {
  final IconData icon;

  const _QuickActionIcon({required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 50,
      height: 50,
      decoration: BoxDecoration(
        color: const Color(0xFFF4FAF9),
        shape: BoxShape.circle,
        border: Border.all(color: const Color(0xFFCBE9E3)),
      ),
      child: Icon(
        icon,
        size: 22,
        color: const Color(0xFF0C8C83),
      ),
    );
  }
}

class _DemoAccountsCard extends StatelessWidget {
  final void Function(String email, String password) onDemoTap;

  const _DemoAccountsCard({required this.onDemoTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FBFB),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2ECEB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Demo accounts',
            style: TextStyle(
              fontSize: 12,
              color: Color(0xFF6B7280),
              fontWeight: FontWeight.w800,
              letterSpacing: 0.4,
            ),
          ),
          const SizedBox(height: 10),
          _DemoAccountTile(
            role: 'Admin',
            email: 'admin@fpt.edu.vn',
            password: 'admin123',
            onTap: onDemoTap,
          ),
          const SizedBox(height: 8),
          _DemoAccountTile(
            role: 'Lecturer',
            email: 'namngv@fpt.edu.vn',
            password: 'lecturer123',
            onTap: onDemoTap,
          ),
          const SizedBox(height: 8),
          _DemoAccountTile(
            role: 'Student',
            email: 'anvse2026001@fpt.edu.vn',
            password: 'student123',
            onTap: onDemoTap,
          ),
        ],
      ),
    );
  }
}

class _DemoAccountTile extends StatelessWidget {
  final String role;
  final String email;
  final String password;
  final void Function(String email, String password) onTap;

  const _DemoAccountTile({
    required this.role,
    required this.email,
    required this.password,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: const Color(0xFFFFFFFF),
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => onTap(email, password),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE7EFEE)),
          ),
          child: Row(
            children: [
              SizedBox(
                width: 68,
                child: Text(
                  role,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1F2937),
                  ),
                ),
              ),
              Expanded(
                child: Text(
                  '$email / $password',
                  style: const TextStyle(
                    fontSize: 11,
                    color: Color(0xFF6B7280),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              const Icon(
                Icons.arrow_forward_ios_rounded,
                size: 14,
                color: Color(0xFF9CA3AF),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BrandPanel extends StatelessWidget {
  const _BrandPanel();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(30),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFF0E6665),
            Color(0xFF02505A),
            Color(0xFF043E49),
          ],
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(30),
        child: Stack(
          children: [
            Positioned(
              right: -85,
              bottom: 120,
              child: Container(
                width: 290,
                height: 290,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.08),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Positioned(
              right: 100,
              bottom: -70,
              child: Container(
                width: 175,
                height: 175,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.08),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(42, 42, 42, 34),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Hệ thống quản lý\ndự án học tập',
                    style: TextStyle(
                      fontSize: 34,
                      height: 1.08,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 42),
                  const Icon(
                    Icons.format_quote,
                    color: Color(0xFF59E0CF),
                    size: 44,
                  ),
                  const SizedBox(height: 18),
                  const Text(
                    '"Trải nghiệm phương thức hiện đại,\ntối ưu và hiệu quả cao để quản lý\ncác lớp học và theo dõi tiến trình\ngiáo dục của bạn."',
                    style: TextStyle(
                      fontSize: 17,
                      height: 1.7,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFFE8FFFF),
                    ),
                  ),
                  const Spacer(),
                  Align(
                    alignment: Alignment.bottomRight,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 18,
                        vertical: 14,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.96),
                        borderRadius: BorderRadius.circular(22),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircleAvatar(
                            radius: 16,
                            backgroundColor: Color(0xFFE7FAF6),
                            child: Icon(
                              Icons.school_outlined,
                              color: Color(0xFF0B8178),
                              size: 18,
                            ),
                          ),
                          SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'Education Management System',
                                style: TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 14,
                                  color: Color(0xFF1B2C34),
                                ),
                              ),
                              SizedBox(height: 3),
                              Text(
                                'Nền tảng Quản lý Giáo dục',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF77838F),
                                ),
                              ),
                            ],
=======
  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF2563EB), Color(0xFF3B82F6)],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: const Color.fromRGBO(0, 0, 0, 0.1),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.analytics_outlined,
                      size: 40,
                      color: Color(0xFF2563EB),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'JIRA-GitHub Export',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Mobile App',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white70,
                    ),
                  ),
                  const SizedBox(height: 48),

                  // Login Form Card
                  Card(
                    elevation: 8,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const Text(
                            'Đăng nhập',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 24),

                          // Email Input
                          TextField(
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            decoration: const InputDecoration(
                              labelText: 'Email',
                              prefixIcon: Icon(Icons.email_outlined),
                              hintText: 'your@email.com',
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Password Input
                          TextField(
                            controller: _passwordController,
                            obscureText: _obscurePassword,
                            decoration: InputDecoration(
                              labelText: 'Mật khẩu',
                              prefixIcon: const Icon(Icons.lock_outlined),
                              hintText: '••••••••',
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _obscurePassword
                                      ? Icons.visibility_outlined
                                      : Icons.visibility_off_outlined,
                                ),
                                onPressed: () {
                                  setState(() {
                                    _obscurePassword = !_obscurePassword;
                                  });
                                },
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),

                          // Forgot Password
                          Align(
                            alignment: Alignment.centerRight,
                            child: TextButton(
                              onPressed: () => context.go('/forgot-password'),
                              child: const Text('Quên mật khẩu?'),
                            ),
                          ),

                          // Error Message
                          if (_error != null)
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.red.shade50,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.red.shade200),
                              ),
                              child: Text(
                                _error!,
                                style: TextStyle(color: Colors.red.shade700),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          if (_error != null) const SizedBox(height: 16),

                          // Login Button
                          ElevatedButton(
                            onPressed: authProvider.isLoading ? null : _handleLogin,
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                            child: authProvider.isLoading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                    ),
                                  )
                                : const Text(
                                    'Đăng nhập',
                                    style: TextStyle(fontSize: 16),
                                  ),
                          ),
                          const SizedBox(height: 24),

                          // Demo Accounts
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.grey.shade50,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Demo accounts:',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey.shade600,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                _buildDemoAccount('Admin', 'admin@fpt.edu.vn', 'admin123'),
                                _buildDemoAccount('Lecturer', 'namngv@fpt.edu.vn', 'lecturer123'),
                                _buildDemoAccount('Student', 'anvse2026001@fpt.edu.vn', 'student123'),
                              ],
                            ),
>>>>>>> origin
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
<<<<<<< HEAD
          ],
=======
          ),
>>>>>>> origin
        ),
      ),
    );
  }
<<<<<<< HEAD
}

class _MiniBrandBlock extends StatelessWidget {
  const _MiniBrandBlock();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0xFF0E6665),
            Color(0xFF044C57),
          ],
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Hệ thống quản lý\ndự án học tập',
            style: TextStyle(
              color: Colors.white,
              fontSize: 24,
              height: 1.15,
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: 14),
          Text(
            'Trải nghiệm hiện đại và hiệu quả để quản lý lớp học.',
            style: TextStyle(
              color: Color(0xFFE6FAF7),
              fontSize: 14,
              height: 1.5,
=======

  Widget _buildDemoAccount(String role, String email, String password) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          SizedBox(
            width: 70,
            child: Text(
              '$role:',
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            child: Text(
              '$email / $password',
              style: TextStyle(
                fontSize: 10,
                fontFamily: 'monospace',
                color: Colors.grey.shade700,
              ),
>>>>>>> origin
            ),
          ),
        ],
      ),
    );
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> origin

---
title: SpringSecurity配置
date: 2025-11-14 12:00:00
categories:
  - 学习笔记
tags:
  - Java学习
  - 安全
  - Spring
---

# 引入
之前跟着教程做了web后端的项目，打算找个时间上线运营培养经验，不过因为域名的问题一直拖着没做。

但在学习网络安全时，老师提了一句：“为什么不用MD5加密，因为它已经被破解了”，一句话让我的困意瞬间消失。因为我的加密就是用MD5。

# MD5为什么不能用

## MD5的加密逻辑
将输入数据扩展为 512 位的整数倍，用四个 32 位的十六进制整数作为初始链接变量进行四轮循环运算，每轮循环包含 16 次操作，共 64 步。每轮循环结束后，将当前链接变量 A、B、C、D 分别加上临时变量 a、b、c、d。最终，将四个链接变量级联，得到 128 位的 MD5 哈希值。

## 缺点
### 1.计算太快
对于选择的电脑的性能，MD5的计算量太少，攻击者可以轻松通过计算进行解密。
### 2.被证明过不安全
王小云研究团队发现了MD5国际密码算法存在漏洞，被证实MD5并不安全。
# 选择SpringSecurity的原因
## 优势
### 1.导入便捷
SpringSecurity 对于 SpringBoot 项目来说几乎是“标配安全框架”，只需要在pom.xml文件中加入配置就可以进行使用。
### 2.自带BCrypt，加密安全  
BCrypt是慢哈希函数，适合存储密码，带 salt，不可逆，抗暴力破解。
### 3.内置认证 + 授权体系
Security会自己处理：登录验证、过滤器链、会话安全、跨域、csrf、路由权限控制等问题，开发者不需要操心这些方面的问题。

# 配置和导入
## 1.依赖
```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

## 2. 配置类

### 补充：之前没注意Spring2和Spring3的区别
Spring Boot 2.x 配置方式
```
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
                .antMatchers("/public/**").permitAll()
                .anyRequest().authenticated()
            .and()
            .formLogin();
    }
}
```

作者：刘大华
链接：https://juejin.cn/post/7570191839593332799

来源：稀土掘金

SpringBoot 3 去掉了 WebSecurityConfigurerAdapter，用 Bean 配置。
```
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/login", "/register").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(login -> login
                .loginPage("/login")
                .permitAll()
            );
        return http.build();
    }
}
```
## 如何兼容之前的用户
之前在数据库中存储的密码是MD5加密的，如果直接更新加密方法，会导致之前的用户无法登录。所以需要增加一段逻辑。

用户注册->直接使用SpringSecurity加密。

用户登录->如果使用MD5加密：用MD5验证->更新加密逻辑，将新的数据存入数据库。
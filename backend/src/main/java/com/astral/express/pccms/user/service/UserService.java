package com.astral.express.pccms.user.service;

import com.astral.express.pccms.common.exception.BusinessException;
import com.astral.express.pccms.common.exception.ErrorCode;
import com.astral.express.pccms.common.helper.PasswordGenerator;
import com.astral.express.pccms.identity.repository.RefreshTokenRepository;
import com.astral.express.pccms.identity.security.SecurityHelper;
import com.astral.express.pccms.notification.service.EmailService;
import com.astral.express.pccms.user.dto.request.AdminUpdateUserRequest;
import com.astral.express.pccms.user.dto.request.ChangePasswordRequest;
import com.astral.express.pccms.user.dto.request.CreateUserRequest;
import com.astral.express.pccms.user.dto.request.UserProfileUpdateRequest;
import com.astral.express.pccms.user.dto.response.AccountResponse;
import com.astral.express.pccms.user.dto.response.UserResponse;
import com.astral.express.pccms.user.entity.Roles;
import com.astral.express.pccms.user.entity.UserStatus;
import com.astral.express.pccms.user.entity.Users;
import com.astral.express.pccms.user.mapper.UserMapper;
import com.astral.express.pccms.user.repository.RoleRepository;
import com.astral.express.pccms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SecurityHelper securityHelper;
    private final RefreshTokenRepository refreshTokenRepository;

    // ==================== ADMIN OPERATIONS ====================

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('ACCOUNT_MANAGE')")
    public com.astral.express.pccms.common.dto.PageResponse<AccountResponse> searchAccounts(
            String keyword,
            String role,
            UserStatus status,
            Pageable pageable) {
        if (!hasSearchCriteria(keyword, role, status)) {
            throw new BusinessException(ErrorCode.ERR_ACC_007_SEARCH_CRITERIA_REQUIRED);
        }
        Page<Users> users = userRepository.findAll(accountSearchSpecification(keyword, role, status), pageable);
        return com.astral.express.pccms.common.dto.PageResponse.of(users.map(this::toAccountResponse));
    }

    @Transactional
    @PreAuthorize("hasAuthority('ACCOUNT_MANAGE')")
    public AccountResponse updateAccountStatus(UUID accountId, UserStatus statusCode) {
        Users user = findActiveAccount(accountId);
        user.setStatusCode(statusCode);
        Users savedUser = userRepository.save(user);

        if (statusCode == UserStatus.LOCKED || statusCode == UserStatus.DISABLED) {
            refreshTokenRepository.revokeAllUserTokens(accountId);
        }

        log.info("Updated account status: {} -> {}", accountId, statusCode);
        return toAccountResponse(savedUser);
    }

    @Transactional
    @PreAuthorize("hasAuthority('ACCOUNT_MANAGE')")
    public AccountResponse assignAccountRole(UUID accountId, String roleCode) {
        Users user = findActiveAccount(accountId);
        Roles role = roleRepository.findByCodeIgnoreCase(roleCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_ACC_006_ROLE_NOT_FOUND));

        if (!Boolean.TRUE.equals(role.getIsActive())) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION_FAILED);
        }

        user.setRole(role);
        Users savedUser = userRepository.save(user);
        log.info("Assigned account role: {} -> {}", accountId, role.getCode());
        return toAccountResponse(savedUser);
    }

    @Transactional
    @PreAuthorize("hasAuthority('ACCOUNT_MANAGE')")
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException(ErrorCode.ERR_ACC_001_EMAIL_EXISTS);
        }

        Users user = userMapper.toUser(request);

        String plainPassword = PasswordGenerator.generate(8);
        user.setPasswordHash(passwordEncoder.encode(plainPassword));

        Users savedUser = userRepository.save(user);
        emailService.sendAccountCreatedEmail(request.email(), plainPassword);

        log.info("Created new user: {}", savedUser.getEmail());
        return userMapper.toUserResponse(savedUser);
    }

    @Transactional
    @PreAuthorize("hasAuthority('ACCOUNT_MANAGE')")
    public UserResponse adminUpdateUser(UUID userId, AdminUpdateUserRequest request) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_ACC_002_USER_NOT_FOUND));

        userMapper.updateFromAdmin(request, user);

        log.info("Admin updated user: {}", user.getEmail());
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    @PreAuthorize("hasAuthority('ACCOUNT_MANAGE')")
    public void adminLockUser(UUID id) {
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_ACC_002_USER_NOT_FOUND));
        user.setStatusCode(com.astral.express.pccms.user.entity.UserStatus.LOCKED);
        userRepository.save(user);
        refreshTokenRepository.revokeAllUserTokens(id);
        log.info("Locked user: {}", id);
    }

    @Transactional
    @PreAuthorize("hasAuthority('ACCOUNT_MANAGE')")
    public void adminDisableUser(UUID id) {
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_ACC_002_USER_NOT_FOUND));
        user.setStatusCode(com.astral.express.pccms.user.entity.UserStatus.DISABLED);
        userRepository.save(user);
        refreshTokenRepository.revokeAllUserTokens(id);
        log.info("Disabled user: {}", id);
    }

    @Transactional
    @PreAuthorize("hasAuthority('ACCOUNT_MANAGE')")
    public void deleteUser(UUID id) {
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_ACC_002_USER_NOT_FOUND));
        user.setStatusCode(com.astral.express.pccms.user.entity.UserStatus.DISABLED);
        userRepository.save(user);
        log.info("Deleted (soft) user: {}", id);
    }

    @PreAuthorize("hasAuthority('ACCOUNT_MANAGE')")
    public UserResponse getUser(UUID id) {
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_ACC_002_USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    @PreAuthorize("hasAuthority('ACCOUNT_MANAGE')")
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream().map(userMapper::toUserResponse)
                .toList();
    }

    private Users findActiveAccount(UUID accountId) {
        Users user = userRepository.findById(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_ACC_002_USER_NOT_FOUND));
        if (user.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.ERR_ACC_002_USER_NOT_FOUND);
        }
        return user;
    }

    private AccountResponse toAccountResponse(Users user) {
        Roles role = user.getRole();
        String roleCode = role == null ? null : role.getCode();
        return new AccountResponse(
                user.getId(),
                user.getEmail(),
                user.getPhone(),
                user.getFullName(),
                roleCode,
                role == null ? null : role.getName(),
                roleCode == null ? List.of() : List.of(roleCode),
                user.getStatusCode(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private boolean hasSearchCriteria(String keyword, String role, UserStatus status) {
        return status != null || hasText(keyword) || hasText(role);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private Specification<Users> accountSearchSpecification(String keyword, String role, UserStatus status) {
        return combine(
                notDeleted(),
                accountKeywordContains(keyword),
                accountRoleEquals(role),
                accountStatusEquals(status)
        );
    }

    private Specification<Users> notDeleted() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.isNull(root.get("deletedAt"));
    }

    private Specification<Users> accountKeywordContains(String keyword) {
        String normalizedKeyword = normalize(keyword);
        if (normalizedKeyword == null) {
            return null;
        }
        String keywordLike = "%" + normalizedKeyword.toLowerCase(Locale.ROOT) + "%";
        return (root, query, criteriaBuilder) -> criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("fullName")), keywordLike),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), keywordLike),
                criteriaBuilder.like(root.get("phone"), "%" + normalizedKeyword + "%")
        );
    }

    private Specification<Users> accountRoleEquals(String role) {
        String normalizedRole = normalize(role);
        if (normalizedRole == null) {
            return null;
        }
        String roleCode = normalizedRole.toLowerCase(Locale.ROOT);
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(criteriaBuilder.lower(root.join("role").get("code")), roleCode);
    }

    private Specification<Users> accountStatusEquals(UserStatus status) {
        if (status == null) {
            return null;
        }
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("statusCode"), status);
    }

    @SafeVarargs
    private final Specification<Users> combine(Specification<Users>... specifications) {
        List<Specification<Users>> activeSpecifications = new ArrayList<>();
        for (Specification<Users> specification : specifications) {
            if (specification != null) {
                activeSpecifications.add(specification);
            }
        }
        Specification<Users> combined = activeSpecifications.getFirst();
        for (int index = 1; index < activeSpecifications.size(); index++) {
            combined = combined.and(activeSpecifications.get(index));
        }
        return combined;
    }

    // ==================== USER SELF OPERATIONS ====================

    @PreAuthorize("hasAuthority('OWNER_PROFILE_UPDATE')")
    public UserResponse getMyProfile() {
        UUID userId = securityHelper.getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_ACC_002_USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    @Transactional
    @PreAuthorize("hasAuthority('OWNER_PROFILE_UPDATE')")
    public UserResponse updateMyProfile(UserProfileUpdateRequest request) {
        UUID userId = securityHelper.getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_ACC_002_USER_NOT_FOUND));

        userMapper.updateProfile(request, user);

        log.info("User updated profile: {}", user.getEmail());
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    @PreAuthorize("hasAuthority('OWNER_PROFILE_UPDATE')")
    public void changePassword(ChangePasswordRequest request) {
        UUID userId = securityHelper.getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_ACC_002_USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.ERR_IAM_001_INVALID_CREDENTIALS);
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        log.info("User changed password: {}", user.getEmail());
    }
}

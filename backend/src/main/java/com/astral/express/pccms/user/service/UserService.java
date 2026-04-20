package com.astral.express.pccms.user.service;

import com.astral.express.pccms.common.exception.AppException;
import com.astral.express.pccms.common.exception.ErrorCode;
import com.astral.express.pccms.common.helper.PasswordGenerator;
import com.astral.express.pccms.identity.security.SecurityHelper;
import com.astral.express.pccms.notification.service.EmailService;
import com.astral.express.pccms.user.dto.request.AdminUpdateUserRequest;
import com.astral.express.pccms.user.dto.request.ChangePasswordRequest;
import com.astral.express.pccms.user.dto.request.CreateUserRequest;
import com.astral.express.pccms.user.dto.request.UserProfileUpdateRequest;
import com.astral.express.pccms.user.dto.response.UserResponse;
import com.astral.express.pccms.user.entity.Users;
import com.astral.express.pccms.user.mapper.UserMapper;
import com.astral.express.pccms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SecurityHelper securityHelper;

    // ==================== ADMIN OPERATIONS ====================

    @Transactional
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        Users user = userMapper.toUser(request);

        String plainPassword = PasswordGenerator.generate(8);
        user.setHashPassword(passwordEncoder.encode(plainPassword));

        Users savedUser = userRepository.save(user);
        emailService.sendAccountCreatedEmail(request.getEmail(), plainPassword);

        log.info("Created new user: {}", savedUser.getEmail());
        return userMapper.toUserResponse(savedUser);
    }

    @Transactional
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public UserResponse adminUpdateUser(UUID userId, AdminUpdateUserRequest request) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        userMapper.updateFromAdmin(request, user);

        log.info("Admin updated user: {}", user.getEmail());
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        userRepository.deleteById(id);
        log.info("Deleted user: {}", id);
    }

    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public UserResponse getUser(UUID id) {
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream().map(userMapper::toUserResponse)
                .toList();
    }

    // ==================== USER SELF OPERATIONS ====================

    @PreAuthorize("hasAuthority('USER_UPDATE_SELF')")
    public UserResponse getMyProfile() {
        UUID userId = securityHelper.getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    @Transactional
    @PreAuthorize("hasAuthority('USER_UPDATE_SELF')")
    public UserResponse updateMyProfile(UserProfileUpdateRequest request) {
        UUID userId = securityHelper.getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        userMapper.updateProfile(request, user);

        log.info("User updated profile: {}", user.getEmail());
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    @PreAuthorize("hasAuthority('USER_UPDATE_SELF')")
    public void changePassword(ChangePasswordRequest request) {
        UUID userId = securityHelper.getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getHashPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        user.setHashPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("User changed password: {}", user.getEmail());
    }
}

package com.astral.express.pccms.identity.service;

import com.astral.express.pccms.identity.dto.request.OtpConfirmRequest;
import com.astral.express.pccms.identity.dto.request.OtpRequest;
import com.astral.express.pccms.identity.dto.request.PasswordResetConfirmRequest;
import com.astral.express.pccms.user.dto.response.UserResponse;

public interface OtpService {
    void requestPasswordResetOtp(OtpRequest request);

    void confirmPasswordReset(PasswordResetConfirmRequest request);

    void requestEmailChangeOtp(OtpRequest request);

    UserResponse confirmEmailChange(OtpConfirmRequest request);

    void requestPhoneChangeOtp(OtpRequest request);

    UserResponse confirmPhoneChange(OtpConfirmRequest request);
}

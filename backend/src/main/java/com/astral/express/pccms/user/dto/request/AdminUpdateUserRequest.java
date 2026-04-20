package com.astral.express.pccms.user.dto.request;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUpdateUserRequest {
    @Pattern(regexp = "STUDENT|INSTRUCTOR|ADMIN")
    private String roleName;

    private Boolean isActive;
}

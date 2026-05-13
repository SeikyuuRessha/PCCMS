package com.astral.express.pccms.identity.entity;

import com.astral.express.pccms.common.entity.BaseModel;
import com.astral.express.pccms.user.entity.Users;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "RefreshToken")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken extends BaseModel {
    private String hashedToken;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    private Users user;

    private OffsetDateTime expiresAt;
    @Builder.Default
    private boolean isRevoked = false;
}

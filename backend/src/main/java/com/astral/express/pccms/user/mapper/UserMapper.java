package com.astral.express.pccms.user.mapper;

import com.astral.express.pccms.user.dto.request.AdminUpdateUserRequest;
import com.astral.express.pccms.user.dto.request.CreateUserRequest;
import com.astral.express.pccms.user.dto.request.UserProfileUpdateRequest;
import com.astral.express.pccms.user.dto.response.UserResponse;
import com.astral.express.pccms.user.entity.Users;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(source = "role.roleName", target = "roleName")
    UserResponse toUserResponse(Users user);

    @Mapping(source = "roleName", target = "role.roleName")
    Users toUser(CreateUserRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(source = "roleName", target = "role.roleName")
    void updateFromAdmin(AdminUpdateUserRequest request, @MappingTarget Users user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateProfile(UserProfileUpdateRequest request, @MappingTarget Users user);
}

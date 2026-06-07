package com.astral.express.pccms.catalog.repository;

import com.astral.express.pccms.catalog.entity.ServiceCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ServiceCatalogRepository extends JpaRepository<ServiceCatalog, UUID>,
        JpaSpecificationExecutor<ServiceCatalog> {

    boolean existsByServiceCodeIgnoreCase(String serviceCode);

    boolean existsByServiceCodeIgnoreCaseAndIdNot(String serviceCode, UUID id);
}

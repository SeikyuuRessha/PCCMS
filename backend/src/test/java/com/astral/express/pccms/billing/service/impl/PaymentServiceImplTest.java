package com.astral.express.pccms.billing.service.impl;

import com.astral.express.pccms.billing.dto.request.OwnerPaymentRequest;
import com.astral.express.pccms.billing.dto.response.PaymentResponse;
import com.astral.express.pccms.billing.entity.Invoice;
import com.astral.express.pccms.billing.entity.InvoiceStatus;
import com.astral.express.pccms.billing.entity.Payment;
import com.astral.express.pccms.billing.entity.PaymentMethod;
import com.astral.express.pccms.billing.entity.PaymentStatus;
import com.astral.express.pccms.billing.repository.InvoiceRepository;
import com.astral.express.pccms.billing.repository.PaymentRepository;
import com.astral.express.pccms.common.exception.BusinessException;
import com.astral.express.pccms.common.exception.ErrorCode;
import com.astral.express.pccms.identity.security.SecurityHelper;
import com.astral.express.pccms.user.entity.Users;
import com.astral.express.pccms.user.repository.UserRepository;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityHelper securityHelper;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    @ParameterizedTest(name = "[{0}] {1}: amount={2}, expected={6}")
    @CsvFileSource(resources = "/testcases/payment-owner-request.csv", numLinesToSkip = 1)
    void should_ProcessOwnerPaymentRequest_AccordingToRules(
            String ruleId, String caseId, Long inputAmount, Long invoiceTotal,
            Long invoicePaid, boolean isOwner, String expectedResult, String expectedError) {

        // GIVEN
        UUID invoiceId = UUID.randomUUID();
        UUID currentUserId = UUID.randomUUID();
        UUID ownerId = isOwner ? currentUserId : UUID.randomUUID();

        Users owner = new Users();
        owner.setId(ownerId);

        Invoice mockInvoice = new Invoice();
        mockInvoice.setId(invoiceId);
        mockInvoice.setOwner(owner);
        mockInvoice.setTotalAmountVnd(invoiceTotal);
        mockInvoice.setPaidAmountVnd(invoicePaid);
        mockInvoice.setStatusCode(InvoiceStatus.UNPAID);

        OwnerPaymentRequest request = new OwnerPaymentRequest(
                inputAmount, PaymentMethod.BANK_TRANSFER, "REF123", null, "Note"
        );

        if (inputAmount != null && inputAmount > 0) {
            given(invoiceRepository.findByIdForUpdate(invoiceId)).willReturn(Optional.of(mockInvoice));
            given(securityHelper.getCurrentUserId()).willReturn(currentUserId);
        }

        if ("VALID".equals(expectedResult)) {
            Payment savedPayment = new Payment();
            savedPayment.setId(UUID.randomUUID());
            savedPayment.setInvoice(mockInvoice);
            savedPayment.setAmountVnd(inputAmount);
            savedPayment.setStatusCode(PaymentStatus.SUCCEEDED); // Expecting SUCCEEDED based on new logic
            savedPayment.setPaymentCode("PAY-123");

            given(paymentRepository.save(any(Payment.class))).willReturn(savedPayment);

            // WHEN
            PaymentResponse response = paymentService.createOwnerPaymentRequest(invoiceId, request);

            // THEN
            assertThat(response).isNotNull();
            assertThat(response.statusCode()).isEqualTo(PaymentStatus.SUCCEEDED);
            verify(paymentRepository).save(any(Payment.class));
            verify(invoiceRepository).save(mockInvoice);
            
            long expectedPaid = invoicePaid + inputAmount;
            assertThat(mockInvoice.getPaidAmountVnd()).isEqualTo(expectedPaid);
            if (expectedPaid >= invoiceTotal) {
                assertThat(mockInvoice.getStatusCode()).isEqualTo(InvoiceStatus.PAID);
            } else {
                assertThat(mockInvoice.getStatusCode()).isEqualTo(InvoiceStatus.PARTIALLY_PAID);
            }
        } else {
            // WHEN & THEN
            assertThatThrownBy(() -> paymentService.createOwnerPaymentRequest(invoiceId, request))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.valueOf(expectedError));

            verify(paymentRepository, never()).save(any(Payment.class));
        }
    }
}


package com.example.demo.credit;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.customer.CustomerRepository;

@Service
public class CreditService {

    private final CreditTransactionRepository transactionRepository;
    private final CustomerRepository customerRepository;

    public CreditService(
            CreditTransactionRepository transactionRepository,
            CustomerRepository customerRepository) {
        this.transactionRepository = transactionRepository;
        this.customerRepository = customerRepository;
    }

    public List<CreditTransaction> getHistory(Long customerId) {
        checkCustomer(customerId);

        return transactionRepository
                .findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    public BigDecimal getBalance(Long customerId) {
        List<CreditTransaction> transactions = getHistory(customerId);
        BigDecimal balance = BigDecimal.ZERO;

        for (CreditTransaction transaction : transactions) {
            if (transaction.getType()
                    == CreditTransaction.TransactionType.CREDIT) {
                balance = balance.add(transaction.getAmount());
            } else {
                balance = balance.subtract(transaction.getAmount());
            }
        }

        return balance;
    }

    @Transactional
    public CreditTransaction addTransaction(
            Long customerId,
            CreditTransaction.TransactionType type,
            BigDecimal amount,
            String note) {

        checkCustomer(customerId);

        if (type == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Select a transaction type");
        }

        if (amount == null
                || amount.compareTo(BigDecimal.ZERO) <= 0
                || amount.scale() > 2) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Enter a positive amount with at most 2 decimal places");
        }

        if (note != null && note.length() > 500) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Note cannot exceed 500 characters");
        }

        if (type == CreditTransaction.TransactionType.PAYMENT
                && amount.compareTo(getBalance(customerId)) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment cannot exceed the outstanding balance");
        }

        CreditTransaction transaction = new CreditTransaction();
        transaction.setCustomerId(customerId);
        transaction.setType(type);
        transaction.setAmount(amount);
        transaction.setNote(note == null ? null : note.trim());

        return transactionRepository.save(transaction);
    }

    private void checkCustomer(Long customerId) {
        if (customerId == null
                || !customerRepository.existsById(customerId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Customer not found");
        }
    }
}
    
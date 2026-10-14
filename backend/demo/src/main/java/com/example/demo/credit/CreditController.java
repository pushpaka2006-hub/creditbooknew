
package com.example.demo.credit;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/customers/{customerId}")
public class CreditController {

    private final CreditService creditService;

    public CreditController(CreditService creditService) {
        this.creditService = creditService;
    }

    public record TransactionRequest(
            CreditTransaction.TransactionType type,
            BigDecimal amount,
            String note) {
    }

    public record BalanceResponse(
            Long customerId,
            BigDecimal balance) {
    }

    @GetMapping("/balance")
    public BalanceResponse getBalance(
            @PathVariable Long customerId) {
        return new BalanceResponse(
                customerId,
                creditService.getBalance(customerId));
    }

    @GetMapping("/transactions")
    public List<CreditTransaction> getTransactions(
            @PathVariable Long customerId) {
        return creditService.getHistory(customerId);
    }

    @PostMapping("/transactions")
    @ResponseStatus(HttpStatus.CREATED)
    public CreditTransaction addTransaction(
            @PathVariable Long customerId,
            @RequestBody TransactionRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Transaction details are required");
        }

        return creditService.addTransaction(
                customerId,
                request.type(),
                request.amount(),
                request.note());
    }
}

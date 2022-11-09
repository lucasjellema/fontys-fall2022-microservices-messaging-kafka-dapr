package com.myacme.service.controller;

import io.dapr.Topic;
import io.dapr.client.domain.CloudEvent;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import reactor.core.publisher.Mono;

@RestController
public class NameConsumerAndProcessorServiceController {
    
    private static final Logger logger = LoggerFactory.getLogger(NameConsumerAndProcessorServiceController.class);

    @Topic(name = "names", pubsubName = "pubsub")
    @PostMapping(path = "/names", consumes = MediaType.ALL_VALUE)
    public Mono<ResponseEntity> getNameReport(@RequestBody(required = false) CloudEvent<Name> cloudEvent) {
        return Mono.fromSupplier(() -> {
            try {
                logger.info("Subscriber received from Names: " + cloudEvent.getData().getName());
                return ResponseEntity.ok("SUCCESS");
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
    }
}

@Getter
@Setter
class Name {

    public Name(String nameInput) {
        this.name = nameInput;
    }
    private String name;
}


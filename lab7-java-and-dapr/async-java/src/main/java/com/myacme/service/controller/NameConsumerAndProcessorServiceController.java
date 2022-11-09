package com.myacme.service.controller;

import io.dapr.Topic;
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.CloudEvent;
import io.dapr.client.domain.State;

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
    private static final String STATE_STORE_NAME = "statestore";

    @Topic(name = "names", pubsubName = "pubsub")
    @PostMapping(path = "/names", consumes = MediaType.ALL_VALUE)
    public Mono<ResponseEntity> getNameReport(@RequestBody(required = false) CloudEvent<Name> cloudEvent) {
        return Mono.fromSupplier(() -> {
            try {
                logger.info("Subscriber received from Names: " + cloudEvent.getData().getName());
                int nameOccurrenceCount = retrieveIncrementSave(cloudEvent.getData().getName());
                logger.info("Received message with name " + cloudEvent.getData().getName() + " that has occurred a total of " +  nameOccurrenceCount+ " times");
                return ResponseEntity.ok("SUCCESS");
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
    }

    private int retrieveIncrementSave(String name) {
        DaprClient client = new DaprClientBuilder().build();
        Mono<State<String>> result = client.getState(STATE_STORE_NAME, name, String.class);
        // if a result was found, it is turned to an int and incremented by one. if no result was found, this is the first occurrence and the value is set to one
        int numberOfOccurrences = result.block().getValue() == null ? 1 : Integer.parseInt(result.block().getValue())+1;
        client.saveState(STATE_STORE_NAME, name, Integer.toString(numberOfOccurrences)).block();
        Mono<State<String>> result2 = client.getState(STATE_STORE_NAME, name, String.class);
        return Integer.parseInt(result2.block().getValue());
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


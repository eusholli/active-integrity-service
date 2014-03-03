Active Integrity Service
========================

Introdution 
-----------

### Integrity

"Integrity is often defined as the absence of corruption, in systems, networks, processes and data. The base assumption for modern security is that it is impossible to prove the absence of corruption and therefore it is necessary to search for vulnerabilities. The introduction of KSI however brings the scientific method back to the integrity of digital systems by giving a mathematical proof that systems and processes that make up a cloud environment are free of compromise i.e the configuration of every switch and router, the state of every event log and data item in data stores can be verified independently from trusted administrators or in the procedures that define security. The implication is that if you can guarantee the state of your network then any unauthorized change in the state of that network represents an attack, whether internal or external, which can be detected with 100% certainty. It is the difference between searching for needles in a haystack and having real-time situational awareness of every stalk of hay." [Why Guardtime](http://www.guardtime.com/why-guardtime/)

Guardtime represents a paradigm shift in how to secure systems that need to scale to Internet of Things dimensions.  They operate Keyless Signature Infrastucture that enables the replacement of **trust** with **truth** at massive scale and with no need to trust static keys and/or their administrators.  The *Active Integrity Service* packages the guardtime toolkit into an easy to consume service offering.

Below are the sequence diagrams on how each service endpoint should be called and how it should be instrumented into any application that wants to validate in real time whether their system is true and without compromise...

“Nothing is as powerful as an idea whose time has come” - Victor Hugo

## Foundational Understanding

All API calls to the Active Integrity Service is encrypted and the integrity of the total Active Integrity Service is also guardtime protected.  For commercial operations see [Commercial Offers](http://tobedone.com).

The service offers six different kinds of API endpoints.

1. Identity service - everything to do with the identity and state of an endpoint that will consume actions.  The identity is managed through past behaviour rather than static credentials.
2. Action service - manage actions in the system
3. Object service - ensure data integrity of objects
4. Admin service - the administration of endpoints, actions and objects
5. Real Time Analytics Service - the interrogation of system state
6. Reporting service - integration into an operations center and/or situations center

All services use the concept of hashes that are passed in to uniquely represent the identities, actions and data objects that the hashes represent.  At no time does the Active Integrity Service understand anything about the systems or data it protects, thus providing perfect privacy management at the same time and real time situational awareness.

Identity is managed through behaviour rather than static keys.  In this way there is no fear of compromise of credentials and/or compromise of the people managing the credentials.  A unique seed identity is generated, the hash of this is entered into the service by the owner.  Each interaction of the endpoint with the service generates a new hash, that needs to be used in the next interaction along with the previous.  Heuristics around when, where, how, the system calls are made, alongside the one use aspect of each hash generate a signal of how well that endpoint can currently be trusted to be true.

All hashes are of the form SHA-XXX

Authentication of the owner dependant API calls is handled using the [xxx mechanism](http://joyent.com)

## Identity Service

An identity in the system is associated with any endpoint.  An endpoint represents any actor in the system that will have actions performed on it.  Examples could be devices, systems, virtual machines etc.  The identity of the endpoint is managed through managing historical provenence of the endpoint's behavior.  Credentials are transitory in nature and validated alongside previous behaviors such as location, time, frequency of use.  This means there is no need to trust the credentials have not been compromised or need to trust the administrators of the credentials.

### Register
An endpoint is registered in the system with the hash of a unique seed, the unique seed only being known by an owner.  The owner must be authenticated in the system before the create service will execute.

![Sequence Diagram](http://www.websequencediagrams.com/cgi-bin/cdraw?lz=cGFydGljaXBhbnQgT3duZXIgYXMgTwoACwxBY3RpdmUgSW50ZWdyaXR5IFNlcnZpY2UgYXMgQUlTCgp0aXRsZSBJZGVudAATDC0gUmVnaXN0ZXIKCk8tPkFJUzogUE9TVCAvYXBpL3YxL2lkL3IAGwcvKGhhc2ggb2YgdW5pcXVlIHNlZWQgLSBoYXNoLW4pCgphbHQgU3VjY2VzcwogICAgQUlTLT5POiBzAA0HZWxzZSBFcnJvcgASDWkAgQ0IYWxyZWFkeSBleGlzdGluZwplbmQKCg&s=default)

### Create
The owning point makes a create request sending in the hash of the unique seed.  

![Sequence Diagram](http://www.websequencediagrams.com/cgi-bin/cdraw?lz=cGFydGljaXBhbnQgRW5kcG9pbnQgYXMgRQoADgxBY3RpdmUgSW50ZWdyaXR5IFNlcnZpY2UgYXMgQUlTCgp0aXRsZSBJZGVudAATDC0gQ3JlYXRlCgpFLT5BSVM6IFBPU1QgL2FwaS92MS9pZC8oaGFzaCBvZiB1bmlxdWUgc2VlZCAtIGhhc2gtbikKCmFsdCBTdWNjZXNzCiAgICBBSVMtPkU6ABoHKzEKZWxzZSBFcnJvcgATDWkAgQMIYWxyZWFkeSBvd25lZAplbmQKCg&s=default)

It receives a new hash back.  Both the original hash and the new hash must be used in the next interaction with the server, thus receiving a new hash back that then is used in the call after.  And so on...  A hash is only valid for one interaction.

### Verify
An endpoint at any time can request the system validates that it still has operational integrity. That it has not been spoofed or is otherwise compromised.

![Sequence Diagram](http://www.websequencediagrams.com/cgi-bin/cdraw?lz=cGFydGljaXBhbnQgRW5kcG9pbnQgYXMgRQoADgxBY3RpdmUgSW50ZWdyaXR5IFNlcnZpY2UgYXMgQUlTCgp0aXRsZSBJZGVudAATDC0gVmVyaWZ5CgpFLT5BSVM6IEdFVCAvYXBpL3YxL2lkLyhoYXNoLW4pAAEIKzEpCmFsdCBTdWNjZXNzCiAgICBBSVMtPkU6IAAbBzIKZWxzZSBFcnJvcgATDWUAgTcIY29tcHJvbWlzZQplbmQKCm5vdGUgb3ZlciBFLCAAgQEFMm5kAIETByBSZXF1ZXN0AIECICsxAIEaCjIAgQMhMwBzMQ&s=default)

It passes in the latest hash plus the hash before.  It receives a new hash to use in the next request or an error and an alert is raised. This mechanism ensures an endpoint has not been spoofed and/or an older endpoint has not copied a legacy state for neferious reasons.

## Action Service

An action represents an event that an endpoint will be requested to make, that will cause critical change in the system, that must be validated to have integrity before execution.

### Register
An action is registered in the system by an owner.  The owner must be authenticated in the system before the create service will execute.

![Sequence Diagram](http://www.websequencediagrams.com/cgi-bin/cdraw?lz=cGFydGljaXBhbnQgT3duZXIgYXMgTwoACwxBY3RpdmUgSW50ZWdyaXR5IFNlcnZpY2UgYXMgQUlTCgp0aXRsZQAiBW9uABQJLSBSZWdpc3RlcgoKTy0-QUlTOiBQT1NUIC9hcGkvdjEvYQArBS9yAB8HLyhoYXNoIG9mIHVuaXF1ZSAAGgYgc3RyaW5nKQoKYWx0IFN1Y2Nlc3MKICAgIEFJUy0-TzoAJwhlbmNyeXB0IGtleQAaBW5vdGUgb3ZlciBPOgAUCQBHDQplbHNlIEVycm9yAEQNAHIHYWxyZWFkeSBleGlzdAAqBW5kCgo&s=default)

### Verify
Each receiving endpoint of an action verifies it's end point identity and the action hash before executing the action

![Sequence Diagram](http://www.websequencediagrams.com/cgi-bin/cdraw?lz=cGFydGljaXBhbnQgT3duZXIgYXMgTwoACwxFbmRwb2ludCBhcyBFAA0NQWN0aXZlIEludGVncml0eSBTZXJ2aWNlIGFzIEFJUwoKdGl0bGUAIgVvbgAUCS0gVmVyaWZ5CgpPLT5FOiBhABkGKGVuY3J5cHRlZAALBywAEwctaGFzaCkKRS0-QUlTOiBHRVQgL2FwaS92MS8ANQYvKGlkACAFLW4pAAELKzEpLygANg1hbHQgU3VjY2VzcwogICAgQUlTAH0FACkKMiwgdW5pcXVlIGRlAIEJBWlvbiBrZXkAKgVub3RlIG92ZXIgRTogRAAaBgCBNghhbmQgZXhlY3V0ZQplbHNlIEVycm9yAFkNKGUAgkEIY29tcHJvbWlzZSBPUgCBeAgACwopCmVuZAoKCgo&s=default)

In response the client receives back a new endpoint hash, as per the endpoint verification service and action decryption key.  The action can then be decrypted.

## Data Service

Any action that includes data files such as software for upgrade for example, must validate the integrity of the data file before being used.  Thus to avoid malware being loaded into devices unbeknownst to the original data file owner or endpoint operator.

### Register
A data object is registered in the system by an owner.  The owner must be authenticated in the system before the create service will execute.

![Sequence Diagram](http://www.websequencediagrams.com/cgi-bin/cdraw?lz=cGFydGljaXBhbnQgT3duZXIgYXMgTwoACwxBY3RpdmUgSW50ZWdyaXR5IFNlcnZpY2UgYXMgQUlTCgp0aXRsZSBEYXRhABIJLSBSZWdpc3RlcgoKTy0-QUlTOiBQT1NUIC9hcGkvdjEvZGF0YS9yAB0HLyhoYXNoIG9mIGRhdGEgb2JqZWN0KQoKYWx0IFN1Y2Nlc3MKICAgIEFJUy0-TzoACwllbHNlIEVycm9yABINADoLIGFscmVhZHkgZXhpc3RpbmcKZW5kCgo&s=default)

### Verify
Any endpoint that uses a file in a potentially compromising situation sends in the hash of the file for verification with the endpoint hash-n and hash-n+1

![Sequence Diagram](http://www.websequencediagrams.com/cgi-bin/cdraw?lz=cGFydGljaXBhbnQgT3duZXIgYXMgTwoACwxFbmRwb2ludCBhcyBFAA0NQWN0aXZlIEludGVncml0eSBTZXJ2aWNlIGFzIEFJUwoKdGl0bGUgRGF0YQASCS0gVmVyaWZ5CgpPLT5FOiBhY3Rpb24gKGVuY3J5cHRlZAALBywAEwctaGFzaCkKCkFJUwArBWlkAA0FLW4rMiwgdW5pcXVlIGRlADcFaW9uIGtleQpub3RlIG92ZXIgRToAgR8Fb24gY29udGFpbnMgZGF0YSBvYmplY3QgZGVwZW5kYW5jeQogICAgICAgIEUtPkFJUzogR0VUIC9hcGkvdjEvAIEdBi8oAHIJKQABCysxKS8oZGF0YS0ATwYAgSkHYWx0IFN1Y2Nlc3MAVwUAgTcIAA0HIAA2CzIpCmVsc2UgRXJyb3IAIA0AUwUAgSUIY29tcHJvbWlzZSkKCgo&s=default)

In response the client receives back a new endpoint hash, as per the endpoint verification service and success if the file was true otherwise error
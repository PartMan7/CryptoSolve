# CryptoSolve

CryptoSolve is (meant to be) a cryptographically secure mechanism of guaranteeing a user successfully answering a set of questions with the correct answers in order to uncover a token. In simple terms, CryptoSolve has two parts - the 'host' creates a shareable JSON string and distributes it to 'clients' to crack. It's designed to be as fast as possible on the client end while having minimal configuration needed (both the shareable and client can be generated in one line each).

Also, I'm not a cryptography scientist, so please let me know if you discover any vulnerabilities in this.


## Usage

JavaScript
```javascript
// Generator
const { createShareable } = require('cryptosolve');
const qna = [
	['Question 1', 'Answer 1'],
	['Question 2', 'Answer 2'],
	['Question 3', 'Answer 3']
];

const shareJSON = createShareable(qna, 'success_token');


// Client
const { createClient } = require('cryptosolve');

const client = createClient(shareJSON);

client.success; // undefined
client.questions[0]; // Question 1
client.guess('Answer 1'); // true
client.questions[1]; // Question 2
client.guess('Answer 1'); // false
client.questions[2]; // undefined
client.guess('Answer 2'); // true
client.questions[2]; // Question 3
client.guess('Answer 3'); // true
client.length === client.questions.length; // true
client.success; // success_token
```

TypeScript
```typescript
// Generator
import { createShareable } from 'cryptosolve';
const qna: [string, string][] = [
	['Question 1', 'Answer 1'],
	['Question 2', 'Answer 2'],
	['Question 3', 'Answer 3']
];

const shareJSON: string = createShareable(qna, 'success_token');


// Client
import { createClient } from 'cryptosolve';

const client = createClient(shareJSON);

client.success; // undefined
client.questions[0]; // Question 1
client.guess('Answer 1'); // true
client.questions[1]; // Question 2
client.guess('Answer 1'); // false
client.questions[2]; // undefined
client.guess('Answer 2'); // true
client.questions[2]; // Question 3
client.guess('Answer 3'); // true
client.length === client.questions.length; // true
client.success; // success_token
```

## Installation and Requirements

CryptoSolve has zero external dependencies (the only dependency is `node:crypto`), and requires Node.js v6.4 or higher to run.

You can install CryptoSolve in your projects through `npm install cryptosolve` or `yarn install cryptosolve`, depending on your package manager.


## Documentation

CryptoSolve exports a `Utils` object alongside `createShareable` and `createClient` with the encryption and key-generation algorithms. I'm too lazy to go and document those, but feel free to refer to the source code - it's fairly neat and tidy!

```typescript
{
	createShareable (qna: [string, string][], success_token?: string, normalize?: 'id' | 'trim' | 'alphanumeric' | ((answer: string) => string)): string;
	createClient (shareJSON: string, normalize?: ((answer: string) => string)): string;
}
```
### createShareable
`createShareable` is responsible for creating the distributable string for a CryptoSolve Client to solve. It takes the first argument as a list of question-solution pairs and the second as the output token to be displayed on successfully solving all questions. If the output is falsy, no output token is created.

For ease-of-solving, a normalizing feature has also been implemented. By default, answers are normalized to their IDs (lowercased, with all non-alphanumeric characters removed). You may specify `'trim'` or `'alphanumeric'` for the corresponding normalizing functions, or specify your own function. Do note that due to security reasons, if you provide your own custom normalizing function, you will have to independently distribute this to the clients.

### createClient
`createClient` takes in the shareable JSON as a required parameter, and optionally lets the client set their normalizing function if the source shareable used a custom normalizer (see above). It returns a single instance of a CryptoSolve Client.


```typescript
{
	questions: string[]; // List of all revealed questions
	answers: string[]; // List of all successfully-guessed answers
	length: number; // Total number of questions
	success?: string; // Success token; set only after solving all questions and if the generator specified one

	guess: (answer: string) => boolean; // Guesses an answer to continue. On a successful guess, the answer is pushed into the `answers` array, and (if possible) the next question is pushed into the `questions` array. Returns `true` for a correct guess and `false` for an incorrect one. Throws an error if already completed or another error occurs.
}
```

## Algorithms and Methodology
CryptoSolver uses multi-encryption to asymmetrically and securely store questions, answers, and the success token.

* Symmetric Encryption<br/>CryptoSolver uses the AES-256-CBC cipher with a randomized IV (included in the shareable) for symmetric-key-based encryption.
* Asymmetric Encryption<br/>CryptoSolver uses AES-256-CBC algorithm with passphrase-enabled PKCS8 encryption on the key (I have no idea what these words mean but they are _scary_) for asymmetric encryption.
* Composite Encryption<br/>CryptoSolver then generates a symmetric key as well as a pair of asymmetric keys using the passphrase as the normalized answer to the current question, then uses the asymmetric keys to asymmetrically encrypt the symmetric key. The symmetric key is used to symmetrically encrypt the next question block (each block includes the question, the formatted previous answer, and the encrypted key for the following block).

In order to keep the encrypted values secure at every point while keeping client computation minimal, a sacrifice has been made on the scalability - the more question-answer pairs that you encrypt, the longer the final shareable JSON will be.


Shoutouts [@aQrator](https://github.com/aQrator) for the inspiration!

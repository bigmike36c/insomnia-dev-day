# Insomnia Developer Day: Design, Test & Automate Your APIs

Welcome to **Insomnia Dev Day**! In this hands-on workshop, you'll learn how to use **Insomnia**, **Kong Konnect**, and supporting tools to build secure, reliable APIs following APIops best practices.

---

## Workshop Overview

We'll take a **design-first approach** to building and managing a REST API, using the following workflow:

1. **Design** your API spec in Insomnia
2. **Test** your API with unit tests
3. **Deploy** to Kong Konnect and apply security policies
4. **Automate** everything using the `inso` and `decK` CLI tools

By the end, you'll have a fully automated API lifecycle pipeline.

---

## 🛠️ Prerequisites

Make sure the following are installed before the workshop:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [VS Code or other IDE](https://code.visualstudio.com/)
- [Insomnia](https://insomnia.rest/download)
- [Inso CLI](https://docs.insomnia.rest/inso/cli/install)
- [decK CLI](https://docs.konghq.com/deck/latest/installation/)
- [Kong Konnect account](https://konnect.konghq.com)
- [Insomnia account](https://app.insomnia.rest/signup)

---

## 📂 Project Structure

```bash
.
├── data/                   # Local in-memory data for the API
├── routes/                 # Express routes
├── server.js              # Entry point for the API
├── openapi.yaml           # OpenAPI spec for the items API
├── tests/                 # Post-response Insomnia tests
└── README.md              # You're here!
```

## Additions Made During Workshop

During the workshop, we will be modifying the spec, adding tests, and updating the actual code of the API. You can always check the `final` branch but here are the main additions:

### Add PATCH endpoint to the spec

```yaml
patch:
  tags:
    - Items
  summary: Partially update an item by ID
  description: Update one or more fields of an item without replacing the full resource.
  operationId: patchItem
  parameters:
    - in: path
      name: id
      required: true
      schema:
        type: integer
  requestBody:
    required: true
    content:
      application/json:
        schema:
          type: object
          properties:
            name:
              type: string
              example: "Updated name"
            completed:
              type: boolean
              example: true
  responses:
    "200":
      description: Item updated successfully
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Item"
    "400":
      description: Invalid input (e.g., empty name)
    "404":
      description: Item not found
```

### Add tests for PATCH endpoint

```javascript
const code = insomnia.response.code;

// Handle validation error (e.g. empty name)
if (code === 400) {
  insomnia.test("Check if status is 400 for invalid input", () => {
    insomnia.expect(code).to.eql(400);
  });

  insomnia.test(
    "Check if response message matches expected validation error",
    () => {
      insomnia.expect(insomnia.response.body).to.equal("Name is required");
    }
  );

  return; // Skip success-case assertions
}

// Handle not found error (e.g. invalid ID)
if (code === 404) {
  insomnia.test("Check if status is 404 for unknown ID", () => {
    insomnia.expect(code).to.eql(404);
  });

  insomnia.test("Check if response message matches expected error", () => {
    insomnia.expect(insomnia.response.body).to.equal("Item not found");
  });

  return; // Skip success-case assertions
}

// Handle successful patch
if (code === 200) {
  const response = insomnia.response.json();
  const requestBody = JSON.parse(insomnia.request.body.raw);

  insomnia.test("Check if status is 200 for successful patch", () => {
    insomnia.expect(code).to.eql(200);
  });

  if ("name" in requestBody) {
    insomnia.test("Check if patched name matches request body", () => {
      insomnia
        .expect(response)
        .to.have.property(
          "name",
          insomnia.variables.replaceIn(requestBody.name).trim()
        );
    });
  }

  if ("completed" in requestBody) {
    insomnia.test(
      "Check if patched completed field matches request body",
      () => {
        insomnia
          .expect(response)
          .to.have.property("completed", requestBody.completed);
      }
    );
  }
} else {
  console.warn(`There is no test for status code ${code}`);
}
```

### Add new code to Express API

```javascript
router.patch("/:id", (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).send("Item not found");

  if (typeof req.body.name === "string") {
    const trimmedName = req.body.name.trim();
    if (!trimmedName) {
      return res.status(400).send("Name is required");
    }
    item.name = trimmedName;
  }
  if (typeof req.body.completed === "boolean") {
    item.completed = req.body.completed;
  }

  res.json(item);
});
```

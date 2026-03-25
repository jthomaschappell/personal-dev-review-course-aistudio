import { CourseDay } from "../types";

export const day3: CourseDay = {
  day: 3,
  title: "Design Patterns",
  subtitle: "Patterns are a shared vocabulary. Know the names and shapes, not just the code.",
  estimatedMinutes: 90,
  sections: [
    {
      id: "solid-principles",
      title: "SOLID Principles",
      body: `**SRP (Single Responsibility)** — A class should have only one reason to change. If your \`UserService\` handles authentication AND email notifications, split it.

**OCP (Open/Closed)** — Software entities should be open for extension but closed for modification. Use interfaces and polymorphism instead of modifying existing code.

**LSP (Liskov Substitution)** — Subclasses must be substitutable for their base class without breaking the program. If \`Square\` extends \`Rectangle\`, setting width shouldn't silently change height.

**ISP (Interface Segregation)** — Don't force clients to depend on methods they don't use. Split fat interfaces into smaller, role-specific ones.

**DIP (Dependency Inversion)** — Depend on abstractions (interfaces), not concretions (classes). High-level modules shouldn't import low-level modules directly.`,
      diagram: {
        type: "mermaid",
        code: `graph TD
  subgraph SOLID["SOLID Principles"]
    SRP["S — Single Responsibility<br/>One class, one reason to change"]
    OCP["O — Open/Closed<br/>Extend behavior, don't modify source"]
    LSP["L — Liskov Substitution<br/>Subtype must replace base type"]
    ISP["I — Interface Segregation<br/>Small, focused interfaces"]
    DIP["D — Dependency Inversion<br/>Depend on abstractions"]
  end
  SRP --> OCP --> LSP --> ISP --> DIP`,
        caption: "The five SOLID principles and their one-line definitions"
      },
      quiz: [
        {
          question: "What does the Single Responsibility Principle state?",
          options: [
            "A function should do only one thing",
            "A class should have only one reason to change",
            "A module should have one export",
            "A file should contain one class"
          ],
          correctIndex: 1,
          explanation: "SRP is about cohesion — a class should be focused on one responsibility, meaning there's only one reason it would need to change."
        },
        {
          question: "Which principle says 'depend on abstractions, not concretions'?",
          options: ["OCP", "LSP", "ISP", "DIP"],
          correctIndex: 3,
          explanation: "Dependency Inversion Principle (DIP) says high-level modules should depend on interfaces, not concrete implementations."
        },
        {
          question: "A Square class that extends Rectangle but breaks when width is set independently violates which principle?",
          options: ["SRP", "OCP", "LSP", "ISP"],
          correctIndex: 2,
          explanation: "Liskov Substitution — if a subtype can't be used wherever the base type is expected without breaking behavior, LSP is violated."
        }
      ]
    },
    {
      id: "creational-patterns",
      title: "Creational Patterns",
      body: `**Singleton** ensures a class has only one instance and provides a global access point. Useful for database connections, config managers, or loggers. The risk: hidden global state makes testing harder.

**Factory Method** defines an interface for creating objects but lets subclasses decide which class to instantiate. Instead of \`new Dog()\` or \`new Cat()\`, call \`animalFactory.create("dog")\`. This decouples creation from usage.

**Builder** separates the construction of complex objects from their representation. Instead of a constructor with 15 parameters, chain calls: \`new QueryBuilder().select("*").from("users").where("active").build()\`. Especially useful when many parameters are optional.

When to use each: Singleton when you need exactly one instance. Factory when you have a family of related objects. Builder when object construction is complex with many optional parts.`,
      diagram: {
        type: "mermaid",
        code: `graph TD
  subgraph Singleton["Singleton"]
    S_Client["Client"] --> S_Instance["getInstance()"]
    S_Instance --> S_Single["Single Instance"]
  end
  subgraph Factory["Factory Method"]
    F_Client["Client"] --> F_Factory["AnimalFactory.create(type)"]
    F_Factory --> F_Dog["Dog"]
    F_Factory --> F_Cat["Cat"]
    F_Factory --> F_Bird["Bird"]
  end`,
        caption: "Singleton single-instance access; Factory method delegation"
      },
      quiz: [
        {
          question: "What is the main risk of the Singleton pattern?",
          options: [
            "It's too slow",
            "Hidden global state makes testing difficult",
            "It uses too much memory",
            "It doesn't support inheritance"
          ],
          correctIndex: 1,
          explanation: "Singletons introduce hidden global state, making unit tests harder because you can't easily substitute or reset the instance."
        },
        {
          question: "When is the Builder pattern most useful?",
          options: [
            "When you need exactly one instance",
            "When object construction has many optional parameters",
            "When you need to clone objects",
            "When objects are immutable"
          ],
          correctIndex: 1,
          explanation: "Builder shines when constructing complex objects with many optional parts — it replaces long parameter lists with readable chained calls."
        },
        {
          question: "What does the Factory Method pattern decouple?",
          options: [
            "Serialization from deserialization",
            "Object creation from object usage",
            "Inheritance from composition",
            "State from behavior"
          ],
          correctIndex: 1,
          explanation: "Factory Method lets the client request an object without knowing its concrete class — creation logic is isolated in the factory."
        }
      ]
    },
    {
      id: "structural-patterns",
      title: "Structural Patterns",
      body: `**Adapter** wraps an incompatible interface to make it work with your code. Think of a power adapter for a European outlet — the plug stays the same for your device. In code: you wrap a third-party XML API with an adapter that exposes a JSON-like interface your app expects.

**Decorator** adds behavior to an object dynamically without modifying its class. Think of middleware in Express: each middleware wraps the request handler, adding logging, auth, or compression. Decorators stack — you can layer multiple behaviors.

**Facade** provides a simplified interface to a complex subsystem. Instead of calling 5 different classes to send an email (SMTP, template engine, HTML sanitizer, attachment handler, queue), you call \`emailService.send(to, subject, body)\`. The facade hides the wiring.

Use Adapter for incompatible interfaces. Decorator for adding optional behavior. Facade for simplifying complex APIs.`,
      diagram: {
        type: "mermaid",
        code: `graph LR
  subgraph Adapter["Adapter Pattern"]
    A_Client["Your Code<br/>(expects JSON)"] --> A_Adapter["Adapter"] --> A_Legacy["Legacy XML API"]
  end
  subgraph Decorator["Decorator Pattern"]
    D_Base["BaseHandler"] --> D_Log["+ LoggingDecorator"]
    D_Log --> D_Auth["+ AuthDecorator"]
    D_Auth --> D_Cache["+ CacheDecorator"]
  end`,
        caption: "Adapter wrapping an incompatible interface; Decorator layering behaviors"
      },
      quiz: [
        {
          question: "Which pattern wraps an incompatible interface to match what your code expects?",
          options: ["Facade", "Decorator", "Adapter", "Proxy"],
          correctIndex: 2,
          explanation: "Adapter converts one interface into another that the client expects, enabling incompatible classes to work together."
        },
        {
          question: "How is Decorator different from inheritance?",
          options: [
            "Decorators are faster",
            "Decorators add behavior at runtime without modifying the class",
            "Decorators only work with interfaces",
            "Decorators are compile-time only"
          ],
          correctIndex: 1,
          explanation: "Unlike inheritance (static, at compile time), decorators wrap objects at runtime, allowing flexible behavior composition."
        },
        {
          question: "What is the purpose of a Facade?",
          options: [
            "To add behaviors dynamically",
            "To convert interfaces",
            "To provide a simplified interface to a complex subsystem",
            "To ensure only one instance exists"
          ],
          correctIndex: 2,
          explanation: "Facade hides the complexity of multiple subsystems behind a single, simple interface."
        }
      ]
    },
    {
      id: "behavioral-patterns",
      title: "Behavioral Patterns",
      body: `**Observer** defines a one-to-many dependency. When the subject changes state, all registered observers are notified automatically. Think of event listeners in the DOM, or React's state + re-render cycle. The subject doesn't know the concrete observers — it just calls their \`update()\` method.

**Strategy** lets you swap algorithms at runtime. Instead of if/else blocks choosing a sorting method, define a \`SortStrategy\` interface and inject the concrete strategy. The context delegates to whichever strategy is plugged in. Clean, extensible, testable.

**Command** encapsulates a request as an object. This lets you parameterize methods with actions, queue them, log them, or support undo. Think of a text editor: each keystroke is a Command object with \`execute()\` and \`undo()\` methods, stored in a history stack.

These patterns promote loose coupling — objects communicate through abstractions, making systems easier to extend and test.`,
      diagram: {
        type: "mermaid",
        code: `graph TD
  subgraph Observer["Observer Pattern"]
    Subject["Subject<br/>(EventEmitter)"] -->|"notify()"| O1["Observer A"]
    Subject -->|"notify()"| O2["Observer B"]
    Subject -->|"notify()"| O3["Observer C"]
  end
  subgraph Strategy["Strategy Pattern"]
    Context["Context"] -->|"delegates to"| S_IF["Strategy Interface"]
    S_IF --> SA["StrategyA<br/>(BubbleSort)"]
    S_IF --> SB["StrategyB<br/>(MergeSort)"]
    S_IF --> SC["StrategyC<br/>(QuickSort)"]
  end`,
        caption: "Observer event flow; Strategy swappable algorithm delegation"
      },
      quiz: [
        {
          question: "In the Observer pattern, what does the subject do when its state changes?",
          options: [
            "It modifies all observer states directly",
            "It notifies all registered observers",
            "It creates new observer instances",
            "It polls observers for updates"
          ],
          correctIndex: 1,
          explanation: "The subject maintains a list of observers and calls their update/notify method when its own state changes."
        },
        {
          question: "What problem does the Strategy pattern solve?",
          options: [
            "Too many classes in the system",
            "Hard-coded algorithm selection via if/else chains",
            "Memory leaks in event listeners",
            "Circular dependencies"
          ],
          correctIndex: 1,
          explanation: "Strategy eliminates conditional algorithm selection by encapsulating each algorithm behind a common interface, swappable at runtime."
        },
        {
          question: "Why is the Command pattern useful for implementing undo?",
          options: [
            "Commands are immutable",
            "Each command encapsulates execute() and undo() methods and can be stored in a history stack",
            "Commands prevent memory leaks",
            "Commands run in parallel"
          ],
          correctIndex: 1,
          explanation: "By encapsulating operations as objects with execute/undo methods, you can maintain a history stack and replay or reverse operations."
        }
      ]
    }
  ],
  summary: [
    "SOLID principles guide class design: single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion",
    "Singleton ensures one instance; Factory delegates creation; Builder handles complex construction",
    "Adapter converts interfaces; Decorator adds runtime behavior; Facade simplifies complex subsystems",
    "Observer enables reactive one-to-many notifications; Strategy swaps algorithms; Command encapsulates actions for undo/redo",
    "All patterns promote loose coupling and make systems easier to test and extend"
  ],
  furtherReading: [
    { label: "Refactoring Guru — Design Patterns", url: "https://refactoring.guru/design-patterns" },
    { label: "SourceMaking — SOLID Principles", url: "https://sourcemaking.com/solid" },
    { label: "Head First Design Patterns (free chapters)", url: "https://www.oreilly.com/library/view/head-first-design/9781492077992/" }
  ]
};

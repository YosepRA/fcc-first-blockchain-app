pragma solidity ^0.5.0;

contract TodoList {
  uint public taskCount = 0;

  // Struct is a custom data type. 
  // Solidity is statically-typed, unlike JavaScript. So you have to
  // declare the types of your data first.
  struct Task {
    uint id;
    string content;
    bool completed;
  }

  // Mapping is a data structure kind of like Hash maps.
  // It maps out the key and value according to its type.
  // And it will virtually maps out EVERY single combination of declared
  // key-value pairing.
  // Therefore, there is no such thing as iterating over all of the content
  // inside mapping, because it's not feasible for the amount of combinations
  // there may be.
  mapping(uint => Task) public tasks;

  event TaskCreated(uint id, string content, bool completed);

  event TaskCompleted(uint id, bool completed);

  // Constructor. Just like it says. It will only run once upon creation.
  constructor() public {
    createTask("Check out the first item of this list");
  }

  // Function. Just like it says. A block of code you can call.
  function createTask(string memory _content) public {
    taskCount ++;
    tasks[taskCount] = Task(taskCount, _content, false);

    emit TaskCreated(taskCount, _content, false);
  }

  function toggleCompleted(uint _id) public {
    Task memory _task = tasks[_id];
    _task.completed = !_task.completed;
    tasks[_id] = _task;

    emit TaskCompleted(_id, _task.completed);
  }
}

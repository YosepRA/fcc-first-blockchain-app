const App = {
  loading: false,
  contracts: {},
  async load() {
    await this.loadWeb3();
    await this.loadAccount();
    await this.loadContract();
    await this.render();
  },
  async loadWeb3() {
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      this.web3Provider = ethereum;

      try {
        // Request account access if needed
        await ethereum.enable();
        // Acccounts now exposed
        // web3.eth.sendTransaction({
        //   /* ... */
        // });
      } catch (error) {
        // User denied account access...
        console.log(error.message);
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(web3.currentProvider);
      // Acccounts always exposed
      web3.eth.sendTransaction({
        /* ... */
      });
    }
    // Non-dapp browsers...
    else {
      console.log(
        'Non-Ethereum browser detected. You should consider trying MetaMask!',
      );
    }
  },
  async loadAccount() {
    this.account = web3.eth.accounts[0];
    web3.eth.defaultAccount = this.account;
  },
  async loadContract() {
    const todoList = await $.getJSON('TodoList.json');

    this.contracts.TodoList = TruffleContract(todoList);
    this.contracts.TodoList.setProvider(this.web3Provider);

    this.todoList = await this.contracts.TodoList.deployed();
  },
  async render() {
    if (this.loading) return undefined;

    this.setLoading(true);

    $('#account').html(this.account);

    await this.renderTasks();

    this.setLoading(false);

    return undefined;
  },
  async renderTasks() {
    // Load tasks from blockchain.
    const taskCount = await this.todoList.taskCount();

    const tasksPromise = [];

    for (let i = 1; i <= taskCount; i += 1) {
      const task = this.todoList.tasks(i);

      tasksPromise.push(task);
    }

    // Iterate through tasks and create node using a template.
    const $taskTemplate = $('.taskTemplate');
    const tasks = await Promise.all(tasksPromise);

    tasks.forEach((task) => {
      const taskId = task[0].toNumber();
      const taskContent = task[1];
      const taskCompleted = task[2];

      const $newTaskTemplate = $taskTemplate.clone();

      $newTaskTemplate.find('.content').html(taskContent);
      $newTaskTemplate
        .find('input')
        .prop('name', taskId)
        .prop('checked', taskCompleted)
        .on('click', this.toggleCompleted.bind(this));

      if (taskCompleted) {
        $('#completedTaskList').append($newTaskTemplate);
      } else {
        $('#taskList').append($newTaskTemplate);
      }

      // Show tasks into the page.
      $newTaskTemplate.show();
    });
  },
  async createTask() {
    this.setLoading(true);

    const content = $('#newTask').val();
    await this.todoList.createTask(content);

    window.location.reload();
  },
  async toggleCompleted(event) {
    this.setLoading(true);

    const {
      target: { name },
    } = event;

    const taskId = parseInt(name, 10);
    await this.todoList.toggleCompleted(taskId);

    window.location.reload();
  },
  setLoading(loading) {
    this.loading = loading;

    const loader = $('#loader');
    const content = $('#content');

    if (loading) {
      loader.show();
      content.hide();
    } else {
      loader.hide();
      content.show();
    }
  },
};

$(() => {
  $(window).load(() => {
    App.load();
  });
});

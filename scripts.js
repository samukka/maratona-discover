const Modal = {
    open(){
        document
            .querySelector('.modal-overlay')
            .classList.add('active')
    },
    close(){
        document
            .querySelector('.modal-overlay')
            .classList.remove('active')
    }
}
const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions){
        localStorage.setItem("dev.finances:transactions",
        JSON.stringify(transactions))
    }
}
const Transaction = {
    all:Storage.get(),
    
    add(transaction){
        Transaction.all.push(transaction)
        App.reload()
    },
    remove(index){
        Transaction.all.splice(index,1)
        App.reload()
    },
    incomes(){
        let income = 0
        Transaction.all.forEach((transaction) => {
            income += transaction.amount > 0 ? transaction.amount : 0
        })
        return income;
     
    },
    expenses(){
        let expense = 0
        Transaction.all.forEach((transaction) => {
            expense += transaction.amount < 0 ? transaction.amount : 0
        })
        return expense;
        
    },
    total(){
        return (Transaction.incomes() + Transaction.expenses())
    }
}

const Utils = {
    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : ""
        value = String(value).replace(/\D/g,"")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR",{
            style: "currency",
            currency: "BRL"
        })
        return signal+value

    },
    formatAmount(value){
        value = Number(value) * 100
        return value
    },
    formatDate(date){
        const splitedDate = date.split("-")
        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return {
            description: Form.description.value,
            amount:Form.amount.value,
            date:Form.date.value,
        }
    },
    validadeFields() {
        const {description,amount,date} = Form.getValues()
        if(description.trim() === "" || amount.trim() === "" || date.trim() === ""){
           throw new Error("Por favor preencha todos os campos")
        }  
    },
    formatValues(){
        let {description,amount,date} = Form.getValues() 
        amount = Utils.formatAmount(amount)
        date   = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },
    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    submit(event){
       event.preventDefault()
       try {
        Form.validadeFields() 
        const transaction = Form.formatValues()
        Transaction.add(transaction)
        Form.clearFields()
        Modal.close()
        console.log(transaction)
       } catch (error) {
         alert(error.message)  
       }
      
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(trasaction,index){
        console.log(trasaction)
        console.log(index)
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(trasaction,index)
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
    },        
    innerHTMLTransaction(trasaction,index){
        
        const CSSClass = trasaction.amount > 0 ? "income" : "expense"
        const amount = Utils.formatCurrency(trasaction.amount)
        
        const html = ` <tr>
                        <td class="description">${trasaction.description}</td>
                        <td class="${CSSClass}">${amount}</td>
                        <td class="date">${trasaction.date}</td>
                        <td>
                            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
                        </td>
                    </tr>
                    `
        return html
    },
    updateBalance(){
        document.getElementById('incomeDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('TotalDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTransaction(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

const App ={
    init(){
        Transaction.all.forEach(DOM.addTransaction)
        DOM.updateBalance()
        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransaction()
        App.init()
    },
}

App.init()

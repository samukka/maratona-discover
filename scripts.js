const Modal = {
    open(cSelector){
        document
            .querySelector(cSelector)
            .classList.add('active')
    },
    close(cSelector){
        document
            .querySelector(cSelector)
            .classList.remove('active')
    }
}
const exChange = {

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
    },
    getCotacao(moeda){
        if( moeda == '1')
            return 5.43
        else if(moeda == '2') 
        return 6.49 
        else
        return 1
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    select: document.querySelector('select#selectMoney'),
    getValues(){
        return {
            description: Form.description.value,
            amount:Form.amount.value,
            date:Form.date.value,
            select:Form.select.value
        }
    },
    validadeFields() {
        const {description,amount,date} = Form.getValues()
        if(description.trim() === "" || amount.trim() === "" || date.trim() === ""){
           throw new Error("Por favor preencha todos os campos")
        }  
    },
    formatValues(){
        let {description,amount,date,select} = Form.getValues() 
        amount = Utils.formatAmount(amount)
        date   = Utils.formatDate(date)

        return {
            description,
            amount,
            date,
            select
        }
    },
    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    AjustaMoeda(cotacao,selected){
        Transaction.all.forEach((transaction)=>{
            if (selected == '0' && transaction.select != '0')
                {
                    transaction.amount = transaction.amount / Utils.getCotacao(transaction.select)
                    transaction.select = selected 
                }
                else if (selected != '0' && transaction.select != selected )  
                {  
                    transaction.amount = transaction.amount / Utils.getCotacao(transaction.select)
                    transaction.amount *= cotacao 
                    transaction.select = selected
                }
                else
                {
                    transaction.amount = transaction.amount / Utils.getCotacao(transaction.select)
                    transaction.select = selected 
                }
            })
    },
    submit(event){
       event.preventDefault()
       try {
        Form.validadeFields() 
        const transaction = Form.formatValues()
        Transaction.add(transaction)
        Form.clearFields()
        Modal.close('.modal-overlay')
       } catch (error) {
         alert(error.message)  
       }
      
    },
    exChange(event){
        event.preventDefault()
        try {
        
         let {select} = Form.getValues() 
         cotacao =  Utils.getCotacao(select)
         Form.AjustaMoeda(cotacao,select)
         Form.clearFields()
         App.reload()
         Modal.close('.modal-money')
        } catch (error) {
          alert(error.message)  
        }
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(trasaction,index){
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

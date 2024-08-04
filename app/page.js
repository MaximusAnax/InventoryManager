'use client' //Declares a client-side app, since this will be what clients will use. 
import Image from "next/image";
import {useState, useEffect} from 'react'
import {firestore} from '@/firebase'
import {Box, Typography, Modal, Stack, TextField, Button} from '@mui/material'
import {query, collection, getDocs, getDoc, deleteDoc, doc, setDoc} from 'firebase/firestore'

export default function Home() {
  // Creating variables to store the relevant information we need
  const [inventory, setInventory] = useState([]) //declares the inventory variable and sets its default to an empty array
  const [itemOpen, setItemOpen] = useState(false) //declares the open variable(wether the inventory is open or not) sets its default to the false boolean 
  const [quantOpen, setQuantOpen] = useState({'':false})
  const [itemName, setItemName] = useState('') //declares the itemName variable and sets its default to an empty string
  const [itemQuantity, setItemQuantity] = useState(1) //declares the itemQuantity variable and sets its default to 1.
  //Functions 

  //A function that fetches the inventory from the firebase firestore database.
  const updateInventory = async() => { //async means that it won't block the code while fetching, therefore not freezing the site.(maybe the other way around)
    const snapshot = query(collection(firestore, 'inventory')) //gets the snapshot of the collection from the database
    const docs = await getDocs(snapshot) //gets a snapshot of the document from the snapshot of the collection
    const inventoryList = [] //declares the inventoryList variable and defaults it to an empty array. This will contain the ENTIRE inventory.
    
    //going through each document, push an object, containing the name of the document and the data within it, into the inventoryList array
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data()
      })
    })
    setInventory(inventoryList)// Sets the updated inventory as the final inventoryList once all docs have been parsed through
    //console.log(inventoryList)
  }

  //A function that removes an item from the inventory and database
  const removeItem = async(item, sub_quantity) =>{
    const docRef = doc(collection(firestore, 'inventory'), item) //finds the item being substracted from
    const docSnap = await getDoc(docRef) //gets a snapshot of the item

    if(docSnap.exists()){
      const quantity = docSnap.get('quantity') //gets the quantity of the item
      if (quantity - sub_quantity < 1){
        await deleteDoc(docRef) //deletes the document
      }
      else{
        await setDoc(docRef, {quantity: quantity - sub_quantity}) //substracts 1 from the quantity of the item
      }
    }
    //Could potentially make an error message if it doesn't exist

    await updateInventory()
  }

  //A function that adds an item from the inventory and database
  const addItem = async(item, add_quantity) =>{
    const docRef = doc(collection(firestore, 'inventory'), item) //finds the item being added to
    const docSnap = await getDoc(docRef) //gets a snapshot of the item

    if(docSnap.exists()){
      const quantity = docSnap.get('quantity') //gets the quantity of the item
      await setDoc(docRef, {quantity: Number(quantity) + add_quantity}) //adds the specified quantity to the quantity of the item
      }
    else{
      await setDoc(docRef, {quantity: add_quantity}) 
    }
    await updateInventory()
  }

  //useEffect runs the code before the comma(in this case updateInventory) whenever something in its dependency array(after the comma and currently empty) changes. 
  useEffect(() =>{
    updateInventory()
    },
    []//since theres nothing in the dependency array, this useEffect just runs once when the page loads
  )
  
  //Modal Functions
  const handleOpen = () => setItemOpen(true)
  const handleClose = () => setItemOpen(false)
  const handleQuantOpen = (item, op) => setQuantOpen({name:item, operation:op, open:true})
  const handleQuantClose = (item, op) => setQuantOpen({name:item, operation:op, open:false})

  return (
    <Box 
    width='100vw'
    height='100vh'
    display='flex'
    flexDirection='column'
    justifyContent='center'
    alignItems='center'
    gap={2}
    > 
      <Button variant = 'contained' onClick={()=>{
        handleOpen()
        }}
      >
        Add New Item
      </Button>

      <Modal open={itemOpen} onClose={handleClose} 
      //The Pop Up when 'Add New Item' button above is pressed
      >
        <Box 
        position='absolute' //centers the box
        top='50%'
        left='50%'
        width={400}
        bgcolor='white'
        border='2px solid #0000'
        boxShadow={24}
        p={4}
        display='flex'
        flexDirection='column'
        gap={3}
        sx={{
          transform: 'translate(-50%,-50%)',
        }}
        >
          <Typography variant='h6'>Add Item</Typography>

          <Stack width='100%' direction='row' spacing={2}>
            <TextField 
            variant='outlined'
            fullWidth 
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value
              )
            }}
            />

            <TextField 
            variant='outlined'
            fullWidth 
            value={itemQuantity}
            onChange={(e) => {
              setItemQuantity(e.target.value)
            }}
            />

            <Button variant='outlined' onClick={()=>{
              addItem(itemName, Number(itemQuantity))

              setItemName('')
              setItemQuantity(1)
              handleClose()
            }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      
      <Modal open={quantOpen.open} onClose={handleQuantClose} 
      //The pop up when either add or remove is pressed for any particular item
      >
        <Box 
        position='absolute' //centers the box
        top='50%'
        left='50%'
        width={400}
        bgcolor='white'
        border='2px solid #0000'
        boxShadow={24}
        p={4}
        display='flex'
        flexDirection='column'
        gap={3}
        sx={{
          transform: 'translate(-50%,-50%)',
        }}
        >
          <Typography variant='h6'>{quantOpen.operation} Quantity of '{quantOpen.name}' </Typography>
          
          <Stack width='100%' direction='row' spacing={2}>
            <TextField 
            variant='outlined'
            fullWidth 
            value={itemQuantity}
            onChange={(e) => {
              setItemQuantity(e.target.value)
            }}
            />
            
            <Button variant='outlined' onClick={()=>{
              if (quantOpen.operation == 'Add'){
                addItem(quantOpen.name, Number(itemQuantity))
              }
              else{
                removeItem(quantOpen.name, Number(itemQuantity))
              }
              setItemQuantity(1)
              handleQuantClose('')
            }}
            >
              {quantOpen.operation}
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Box border='1px solid #333'>
          <Box width= '800px' height= '100px' bgcolor='#add8e6' display='flex' alignItems='center' justifyContent='center'>
            <Typography variant= 'h2' color= '#333'>
              Inventory Items
            </Typography>
          </Box>
        
        <Stack width='800px' height='300px' spacing={2} overflow='auto'>
          {
            inventory.map(({name, quantity})=>(
              <Box 
                key={name} 
                width='100%' 
                minHeight='150px' 
                display='flex' 
                alignItems='center' 
                justifyContent='space-between' 
                bgColor='#f0f0f0' 
                padding={5}
              >
                <Typography variant='h3' color='#333' textAlign='center'>
                  {name}
                </Typography>

                <Typography variant='h3' color='#333' textAlign='center'>
                  {quantity}
                </Typography>
                
                <Stack direction='row' spacing={2}>
                  <Button variant='contained' onClick={()=>{
                    handleQuantOpen(name, 'Add')
                    }}
                  > 
                    Add
                  </Button>

                  <Button variant='contained' onClick={()=>{
                    handleQuantOpen(name, 'Remove')
                    }}
                  > 
                    Remove
                  </Button>

                  <Button variant='contained' onClick={()=>{
                   removeItem(name,quantity)
                    }}
                  > 
                    Clear
                  </Button>
                </Stack>
              </Box>
            ))
          }
        </Stack>
      </Box>
    </Box>
  )
}

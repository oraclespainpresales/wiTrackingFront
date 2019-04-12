package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
	"strings"
	"time"
)

type SmartContract struct {
}

type Product struct {
	SN                    string `json:"SN"`
	Model                 string `json:"Model"`
	SupplierID            string `json:"SupplierID"`
	Assembly_Date         string `json:"Assembly_Date"`
	Supplier_Shipped_Date string `json:"Supplier_Shipped_Date"`

	PO                  string `json:"PO"`
	Shipment            string `json:"Shipment"`
	Pallet              string `json:"Pallet"`
	TransportID         string `json:"TransportID"`
	DestinationID       string `json:"DestinationID"`
	DestinationLabel    string `json:"DestinationLabel"`
	BuyerID             string `json:"BuyerID"`
	Buyer_Received_Date string `json:"Buyer_Received_Date"`
	DistributorID       string `json:"DistributorID"`
	Dist_Received_Date  string `json:"Dist_Received_Date"`
	InstallerID         string `json:"InstallerID"`
	Inst_Received_Date  string `json:"Inst_Received_Date"`
	CustomerID          string `json:"CustomerID"`
	Cust_Installed_Date string `json:"Cust_Installed_Date"`
	Stage               string `json:"Stage"`
	Custodian           string `json:"Custodian"`
	Event               string `json:"Event"`
	NumAlerts           int    `json:"NumAlerts"`
	TxnId               string `json:"TxnId"`
	Timestamp           string `json:"Timestamp"`
}


type PO struct {
	PO                string `json:"PO"`
	PODate           	string `json:"PODate"`
	BuyerID           string `json:"BuyerID"`
	SupplierID        string `json:"SupplierID"`
	Details           string `json:"Details"`
	Shipment          string `json:"Shipment"`
	AcceptSign       	string `json:"AcceptSign"`
	AcceptDate       	string `json:"AcceptDate"`
	DeliveryDate 			string `json:"DeliveryDate"`
	DeliveryLocation	string `json:"DeliveryLocation"`
	Status						string `json:"Status"`
}


func main() {
	err := shim.Start(new(SmartContract))
	if err != nil {	fmt.Printf("Error starting Track & Trace chaincode: %s", err)	}
}

func (s *SmartContract) Init(stub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *SmartContract) Invoke(stub shim.ChaincodeStubInterface) sc.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := stub.GetFunctionAndParameters()

	// Route to the appropriate handler function to interact with the ledger appropriately
	if function == "createProduct" {
		return s.createProduct(stub, args)

	} else if function == "createShipment" {
		return s.createShipment(stub, args)

	} else if function == "takeCustodyOfShipment" {
		return s.takeCustodyOfShipment(stub, args)

	} else if function == "eventForTransport" {
		return s.eventForTransport(stub, args)

	} else if function == "alertForTransport" {
		return s.alertForTransport(stub, args)

	} else if function == "alertForShipment" {
		return s.alertForShipment(stub, args)

	} else if function == "eventForShipment" {
		return s.eventForShipment(stub, args)

	} else if function == "alertForProduct" {
		return s.alertForProduct(stub, args)

	} else if function == "eventForProduct" {
		return s.eventForProduct(stub, args)

	} else if function == "rejectShipment" {
		return s.rejectShipment(stub, args)

	} else if function == "takeCustodyOfProduct" {
		return s.takeCustodyOfProduct(stub, args)

	} else if function == "installProduct" {
		return s.installProduct(stub, args)

	} else if function == "rejectProduct" {
		return s.rejectProduct(stub, args)

	} else if function == "getHistoryForProduct" {
		return s.getHistoryForProduct(stub, args)

	} else if function == "deleteProduct" {
		return s.deleteProduct(stub, args)

	} else if function == "queryProduct" {
		return s.queryProduct(stub, args)

	} else if function == "queryPO" {
		return s.queryPO(stub, args)

	} else if function == "queryProductsByTransport" {
		return s.queryProductsByTransport(stub, args)

	} else if function == "queryProductsByShipment" {
		return s.queryProductsByShipment(stub, args)

	} else if function == "queryProductsByCustodian" {
		return s.queryProductsByCustodian(stub, args)

	} else if function == "queryProductsByPO" {
		return s.queryProductsByPO(stub, args)

	} else if function == "createPO" {
		return s.createPO(stub, args)

	} else if function == "cancelPO" {
		return s.cancelPO(stub, args)

	} else if function == "closePO" {
		return s.closePO(stub, args)

	} else if function == "updatePOWithShipment" {
		return s.updatePOWithShipment(stub, args)

	} else if function == "queryAllPOs" {
		return s.queryAllPOs(stub, args)

	} else if function == "queryPOByBuyer" {
		return s.queryPOByBuyer(stub, args)

	} else if function == "queryPOBySupplier" {
		return s.queryPOBySupplier(stub, args)

	} else if function == "getContractInfo" {
		return s.getContractInfo(stub, args)



	}
	return shim.Error("Invalid Smart Contract function name.")
}



func (s *SmartContract) getContractInfo(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	var buffer bytes.Buffer
	buffer.WriteString("Track & Trace Chaincode.")
	buffer.WriteString("Version 4.x.")

	fmt.Printf("GetContractInfo:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}



func (s *SmartContract) createProduct(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) < 4 {	return shim.Error("Incorrect number of arguments. Expecting 4 o 5:  <sn>, <model>, <supplierID>, <assemblyDate>, <po (optional)>") }
	sn := args[0]
	model := args[1]
	supplierID := args[2]
	assemblyDate := args[3]
	po := ""
	if( len(args) ) > 4 {
		po = args[4]
	}
	stage := "ASSEMBLED"
	event := "Product Assembled"

	var productAsset = Product{SN: sn, Model: model, SupplierID: supplierID, Assembly_Date: assemblyDate, Stage: stage, Custodian: args[2], Event: event, NumAlerts: 0, PO: po}
	productAssetAsBytes, _ := json.Marshal(productAsset)
	err := stub.PutState(sn, productAssetAsBytes)
	if err != nil { return shim.Error(fmt.Sprintf("Failed to create Product : %s", sn)) }

	if err == nil {
		value := []byte{0x00}
		indexKey, err := stub.CreateCompositeKey("Custodian~Product", []string{productAsset.Custodian, productAsset.SN})
		if err == nil { stub.PutState(indexKey, value) }
		indexKey2, err := stub.CreateCompositeKey("PO~Product", []string{productAsset.PO, productAsset.SN})
		if err == nil { stub.PutState(indexKey2, value) }
	}

	return shim.Success(nil)
}



func (s *SmartContract) deleteProduct(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 1 {	return shim.Error("Incorrect number of arguments. Expecting 1: <sn>") }
	sn := args[0]

	productAssetAsBytes, _ := stub.GetState(sn)
	if productAssetAsBytes == nil { return shim.Error("Could not locate Product to delete") }
	productAsset := Product{}
	json.Unmarshal(productAssetAsBytes, &productAsset)

	err := stub.DelState(sn)
	if err != nil { return shim.Error(fmt.Sprintf("Failed to Delete: %s", args[0])) }

	// maintain the indexes
	indexKey, err := stub.CreateCompositeKey("Shipment~Product", []string{productAsset.Shipment, productAsset.SN})
	if err != nil {	return shim.Error(err.Error()) }
	err = stub.DelState(indexKey)
	if err != nil { return shim.Error("Failed to delete state:" + err.Error()) }

	indexKey2, err := stub.CreateCompositeKey("Transport~Product", []string{productAsset.TransportID, productAsset.SN})
	if err != nil {	return shim.Error(err.Error()) }
	err = stub.DelState(indexKey2)
	if err != nil { return shim.Error("Failed to delete state:" + err.Error()) }

	indexKey3, err := stub.CreateCompositeKey("Custodian~Product", []string{productAsset.Custodian, productAsset.SN})
	if err != nil {	return shim.Error(err.Error()) }
	err = stub.DelState(indexKey3)
	if err != nil { return shim.Error("Failed to delete state:" + err.Error()) }

	indexKey4, err := stub.CreateCompositeKey("PO~Product", []string{productAsset.PO, productAsset.SN})
	if err != nil {	return shim.Error(err.Error()) }
	err = stub.DelState(indexKey4)
	if err != nil { return shim.Error("Failed to delete state:" + err.Error()) }
	return shim.Success(nil)
}


func (s *SmartContract) createShipment(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 5 { return shim.Error("Incorrect number of arguments.  Expecting 5: <shipment> <po> <destID> <destLabel> <sn list>") }
	shipment := args[0]
	po := args[1]
	destID := args[2]
	destLabel := args[3]
	prodList := strings.Split(args[4], "~")
	stage := "READY_TO_SHIP"
	event := "Product Added to Shipment " + shipment + " to " + destID

	// If a PO is passed instead of a list of SNs, find SNs associated with PO
	if po != "" && len(prodList)==0 {
		var productArray []Product
		productArrayasBytes := queryProductCollectionBytes(stub, "po", po)
		err := json.Unmarshal(productArrayasBytes, &productArray)
		if err == nil {
			prodList = make([]string, len(productArray))
			for i, productAsset := range productArray {
				prodList[i] = productAsset.SN
			}
		}
	}


	for _, sn := range prodList {
		productAssetAsBytes, _ := stub.GetState(sn)

		if productAssetAsBytes != nil {
			productAsset := Product{}
			json.Unmarshal(productAssetAsBytes, &productAsset)

			oldShipment := productAsset.Shipment
			//oldPO := productAsset.PO

			// Update Product
			productAsset.Shipment = shipment
			if( po != "" ) { productAsset.PO = po }
			productAsset.DestinationID = destID
			productAsset.DestinationLabel = destLabel
			productAsset.Stage = stage
			productAsset.Event = event
			productAssetAsBytes, _ = json.Marshal(productAsset)

			err := stub.PutState(sn, productAssetAsBytes)

			value := []byte{0x00}
			if err == nil {
				indexKey, err := stub.CreateCompositeKey("Shipment~Product", []string{productAsset.Shipment, productAsset.SN})
				if err == nil { stub.PutState(indexKey, value) }
			}
			if err == nil {
				indexKey2, err := stub.CreateCompositeKey("Shipment~Product", []string{oldShipment, productAsset.SN})
				if err == nil { stub.DelState(indexKey2) }
			}
			if err == nil {
				indexKey3, err := stub.CreateCompositeKey("PO~Product", []string{productAsset.PO, productAsset.SN})
				if err == nil { stub.PutState(indexKey3, value) }
			}
			//if err == nil {
			//	indexKey4, err := stub.CreateCompositeKey("PO~Product", []string{oldPO, productAsset.SN})
			//	if err == nil { stub.DelState(indexKey4) }
			//}

		}
	}
	return shim.Success(nil)
}


func (s *SmartContract) takeCustodyOfShipment(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 4 { return shim.Error("Incorrect number of arguments.  Expecting 4: <shipment> <custodian> <transportID> <role>") }
	shipment := args[0]
	custodianID := args[1]
	transportID := args[2]
	role := strings.ToUpper(args[3])
	stage := role + "_RECEIVED"
	event := custodianID + " (" + role + ") took custody of shipment '"+shipment + "'"
	if !strings.EqualFold("LOGISTICS", role) { transportID = "" }

	productIterator, err := stub.GetStateByPartialCompositeKey("Shipment~Product", []string{shipment})
	if err != nil { return shim.Error(err.Error()) }
	defer productIterator.Close()

	//var i int
	//for i = 0; productIterator.HasNext(); i++ {
	for productIterator.HasNext() {
		item, err := productIterator.Next()
		if err != nil { return shim.Error(err.Error()) }

		objectType, keyComposite, err := stub.SplitCompositeKey(item.Key)
		if err != nil { return shim.Error(err.Error() +"for objType = "+ objectType) }

		sn := keyComposite[1]

		response := s.updateProductCustody(stub, sn, custodianID, transportID, stage, event)
		if response.Status != shim.OK { return shim.Error("TakeCustodyOfShipment failed: " + response.Message) }
	}
	return shim.Success(nil)
}


func (s *SmartContract) takeCustodyOfProduct(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 4 { return shim.Error("Incorrect number of arguments.  Expecting 4: <sn> <custodian> <transportID> <role>") }
	sn := args[0]
	custodianID := args[1]
	transportID := args[2]
	role := strings.ToUpper(args[3])
	stage := role + "_RECEIVED"
	event := custodianID + " (" + role + ") took custody of product"
	if !strings.EqualFold("LOGISTICS", role) { transportID = "" }

	response := s.updateProductCustody(stub, sn, custodianID, transportID, stage, event)
	if response.Status != shim.OK { return shim.Error("TakeCustodyOfProduct failed: " + response.Message) }

	return shim.Success(nil)
}


func (s *SmartContract) installProduct(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 2 { return shim.Error("Incorrect number of arguments.  Expecting 2: <sn> <customerID>") }
	sn := args[0]
	customerID := args[1]
	transportID := ""
	//role := "INSTALLER"
	stage := "INSTALLED"
	event := "Product installed at Customer " + customerID

	response := s.updateProductCustody(stub, sn, customerID, transportID, stage, event)
	if response.Status != shim.OK { return shim.Error("installProduct failed: " + response.Message) }

	return shim.Success(nil)
}


func (s *SmartContract) rejectShipment(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 4 { return shim.Error("Incorrect number of arguments.  Expecting 4: <shipment> <custodian> <eventText> <role>") }
	shipment := args[0]
	custodianID := args[1]
	eventText := args[2]
	role := strings.ToUpper(args[3])
	stage := role + "_REJECTED"
	event := "Shipment '"+shipment + "' rejected by "+custodianID+". "+eventText

	productIterator, err := stub.GetStateByPartialCompositeKey("Shipment~Product", []string{shipment})
	if err != nil { return shim.Error(err.Error()) }
	defer productIterator.Close()

	//var i int
	//for i = 0; productIterator.HasNext(); i++ {
	for productIterator.HasNext() {
		item, err := productIterator.Next()
		if err != nil { return shim.Error(err.Error()) }

		objectType, keyComposite, err := stub.SplitCompositeKey(item.Key)
		if err != nil { return shim.Error(err.Error() +"for objType = "+ objectType) }

		sn := keyComposite[1]

		response := s.updateProductCustody(stub, sn, "", "", stage, event)
		if response.Status != shim.OK { return shim.Error("Reject Shipment failed: " + response.Message) }
	}
	return shim.Success(nil)
}


func (s *SmartContract) rejectProduct(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 4 { return shim.Error("Incorrect number of arguments.  Expecting 4: <sn> <custodian> <eventText> <role>") }
	sn := args[0]
	custodianID := args[1]
	eventText := args[2]
	role := strings.ToUpper(args[3])
	stage := role + "_REJECTED"
	event := "Product rejected by "+custodianID+". "+eventText

	response := s.updateProductCustody(stub, sn, "", "", stage, event)
	if response.Status != shim.OK { return shim.Error("Reject Product failed: " + response.Message) }

	return shim.Success(nil)
}



func (s *SmartContract) updateProductCustody(stub shim.ChaincodeStubInterface, sn string, custodianID string, transportID string, stage string, event string) sc.Response {
	ts, errTs := stub.GetTxTimestamp()
	//tss := time.Unix(ts.Seconds, int64(ts.Nanos)).String()
	tss := ""
	if errTs == nil {	tss = time.Unix(ts.Seconds, int64(ts.Nanos)).Format(time.RFC3339) }

	productAssetAsBytes, _ := stub.GetState(sn)
	if productAssetAsBytes == nil { return shim.Error("Could not locate Product Asset") }
	productAsset := Product{}
	json.Unmarshal(productAssetAsBytes, &productAsset)

	oldCustodianID := productAsset.Custodian
	oldTransportID := productAsset.TransportID

	if( custodianID != "" ) { productAsset.Custodian = custodianID }
	productAsset.TransportID = transportID
	productAsset.Event = event
	productAsset.Stage = stage

	if( stage == "BUYER_RECEIVED") {
		productAsset.BuyerID = custodianID
		productAsset.Buyer_Received_Date = tss
	}	else if( stage == "DISTRIBUTOR_RECEIVED") {
		productAsset.DistributorID = custodianID
		productAsset.Dist_Received_Date = tss
	}	else if( stage == "INSTALLER_RECEIVED") {
		productAsset.InstallerID = custodianID
		productAsset.Inst_Received_Date = tss
	}	else if( stage == "INSTALLED") {
		productAsset.CustomerID = custodianID
		productAsset.Cust_Installed_Date = tss
	}

	productAssetAsBytes, _ = json.Marshal(productAsset)
	err := stub.PutState(sn, productAssetAsBytes)
	if err != nil { return shim.Error(fmt.Sprintf("Failed to update Product: %s", sn)) }


	value := []byte{0x00}
	if err == nil {
		indexKey, err := stub.CreateCompositeKey("Transport~Product", []string{productAsset.TransportID, productAsset.SN})
		if err == nil { stub.PutState(indexKey, value) }
	}
	if err == nil {
		indexKey2, err := stub.CreateCompositeKey("Transport~Product", []string{oldTransportID, productAsset.SN})
		if err == nil { stub.DelState(indexKey2) }
	}
	if err == nil {
		indexKey3, err := stub.CreateCompositeKey("Custodian~Product", []string{productAsset.Custodian, productAsset.SN})
		if err == nil { stub.PutState(indexKey3, value) }
	}
	if err == nil {
		indexKey4, err := stub.CreateCompositeKey("Custodian~Product", []string{oldCustodianID, productAsset.SN})
		if err == nil { stub.DelState(indexKey4) }
	}

	return shim.Success(nil)
}


func (s *SmartContract) alertForShipment(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 2 {	return shim.Error("Incorrect number of arguments. Expecting 2: <shipmentID> <eventText>") }
	shipmentID := args[0]
	eventText := args[1]

	response := s.createProductEventsForCollection(stub, "shipment", shipmentID, eventText, true)
	if response.Status != shim.OK { return shim.Error("Alert creation failed: " + response.Message) }
	return shim.Success(nil)
}

func (s *SmartContract) eventForShipment(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 2 {	return shim.Error("Incorrect number of arguments. Expecting 2: <shipmentID> <eventText>") }
	shipmentID := args[0]
	eventText := args[1]

	response := s.createProductEventsForCollection(stub, "shipment", shipmentID, eventText, false)
	if response.Status != shim.OK { return shim.Error("Event creation failed: " + response.Message) }
	return shim.Success(nil)
}

func (s *SmartContract) alertForTransport(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 2 {	return shim.Error("Incorrect number of arguments. Expecting 2: <transportID> <eventText>") }
	transportID := args[0]
	eventText := args[1]

	response := s.createProductEventsForCollection(stub, "transport", transportID, eventText, true)
	if response.Status != shim.OK { return shim.Error("Alert creation failed: " + response.Message) }
	return shim.Success(nil)
}


func (s *SmartContract) eventForTransport(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 2 {	return shim.Error("Incorrect number of arguments. Expecting 2: <transportID> <eventText>") }
	transportID := args[0]
	eventText := args[1]

	response := s.createProductEventsForCollection(stub, "transport", transportID, eventText, false)
	if response.Status != shim.OK { return shim.Error("Event creation failed: " + response.Message) }
	return shim.Success(nil)
}


func (s *SmartContract) alertForProduct(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 2 {	return shim.Error("Incorrect number of arguments. Expecting 2: <sn> <eventText>") }
	sn := args[0]
	eventText := args[1]

	response := s.createProductEvent(stub, sn, eventText, true)
	if response.Status != shim.OK { return shim.Error("Alert creation failed: " + response.Message) }
	return shim.Success(nil)
}


func (s *SmartContract) eventForProduct(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 2 {	return shim.Error("Incorrect number of arguments. Expecting 2: <sn> <eventText>") }
	sn := args[0]
	eventText := args[1]

	response := s.createProductEvent(stub, sn, eventText, false)
	if response.Status != shim.OK { return shim.Error("Event creation failed: " + response.Message) }
	return shim.Success(nil)
}


func (s *SmartContract) createProductEventsForCollection(stub shim.ChaincodeStubInterface, collectionType string, collectionID string, event string, isAlert bool) sc.Response {
	var keyName string
	if( collectionType == "transport" ) {
		keyName = "Transport~Product"
	} else if( collectionType == "shipment" ) {
		keyName = "Shipment~Product"
	} else {
		keyName = "Shipment~Product"
	}

	productIterator, err := stub.GetStateByPartialCompositeKey(keyName, []string{collectionID})
	if err != nil { return shim.Error(err.Error()) }
	defer productIterator.Close()

	//var i int
	//for i = 0; productIterator.HasNext(); i++ {
	for productIterator.HasNext() {
		item, err := productIterator.Next()
		if err != nil { return shim.Error(err.Error()) }
		objectType, keyComposite, err := stub.SplitCompositeKey(item.Key)
		if err != nil { return shim.Error(err.Error()) }
		sn := keyComposite[1]
		fmt.Printf("- found a Product from index:%s "+collectionType+":%s Product:%s\n", objectType, collectionID, sn)
		response := s.createProductEvent(stub, sn, event, isAlert)
		if response.Status != shim.OK { return shim.Error("Transfer failed: " + response.Message) }
	}
	return shim.Success(nil)
}

func (s *SmartContract) createProductEvent(stub shim.ChaincodeStubInterface, sn string, event string, isAlert bool) sc.Response {
	productAssetAsBytes, _ := stub.GetState(sn)
	if productAssetAsBytes == nil { return shim.Error("Could not locate Product Asset") }
	productAsset := Product{}
	json.Unmarshal(productAssetAsBytes, &productAsset)
	productAsset.Event = event
	if isAlert {
		productAsset.NumAlerts += 1
	}
	productAssetAsBytes, _ = json.Marshal(productAsset)
	err := stub.PutState(sn, productAssetAsBytes)
	if err != nil { return shim.Error(fmt.Sprintf("Failed to update Product: %s", sn)) }
	return shim.Success(nil)
}




func (s *SmartContract) queryProduct(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 1 { return shim.Error("Incorrect number of arguments. Expecting 1: <sn>") }
	sn := args[0]
	productAssetAsBytes, _ := stub.GetState(sn)
	if productAssetAsBytes == nil { return shim.Error("Could not locate Product Asset") }
	return shim.Success(productAssetAsBytes)
}



func (s *SmartContract) queryProductsByTransport(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 1 { return shim.Error("Incorrect number of arguments. Expecting 1: <transportID>") }
	transportID := args[0]
	col :=  queryProductCollectionBytes(stub, "transport", transportID)
	if( col != nil ) {
		return shim.Success(col)
	} else {
		return shim.Error("Error getting products")
	}
}


func (s *SmartContract) queryProductsByShipment(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 1 { return shim.Error("Incorrect number of arguments. Expecting 1: <shipmentID>") }
	shipmentID := args[0]
	col :=  queryProductCollectionBytes(stub, "shipment", shipmentID)
	if( col != nil ) {
		return shim.Success(col)
	} else {
		return shim.Error("Error getting products")
	}
}


func (s *SmartContract) queryProductsByCustodian(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 1 { return shim.Error("Incorrect number of arguments. Expecting 1: <shipmentID>") }
	custodian := args[0]
	col := queryProductCollectionBytes(stub, "custodian", custodian)
	if( col != nil ) {
		return shim.Success(col)
	} else {
		return shim.Error("Error getting products")
	}
}


func (s *SmartContract) queryProductsByPO(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 1 { return shim.Error("Incorrect number of arguments. Expecting 1: <PO>") }
	po := args[0]
	col := queryProductCollectionBytes(stub, "po", po)
	if( col != nil ) {
		return shim.Success(col)
	} else {
		return shim.Error("Error getting products")
	}
}


func (s *SmartContract) queryProductCollection(stub shim.ChaincodeStubInterface, collectionType string, collectionID string) sc.Response {
	var keyName string
	if( collectionType == "transport" ) {
		keyName = "Transport~Product"
	} else if( collectionType == "custodian" ) {
		keyName = "Custodian~Product"
	} else if( collectionType == "shipment" ) {
		keyName = "Shipment~Product"
	} else if( collectionType == "po" ) {
		keyName = "PO~Product"
	} else {
		keyName = "Shipment~Product"
	}

	productIterator, err := stub.GetStateByPartialCompositeKey(keyName, []string{collectionID})
	if err != nil { return shim.Error(err.Error()) }
	defer productIterator.Close()

	var productArray []Product
	//var i int
	//for i = 0; productIterator.HasNext(); i++ {
	for productIterator.HasNext() {
		item, err := productIterator.Next()
		if err != nil { return shim.Error(err.Error()) }

		_, keyComposite, err := stub.SplitCompositeKey(item.Key)
		if err != nil {	return shim.Error(err.Error()) }
		sn := keyComposite[1]

		productAssetAsBytes, err := stub.GetState(sn)
		if err != nil {
			return shim.Error("Failed to get product:" + err.Error())
		} else if productAssetAsBytes == nil {
			return shim.Error("Product does not exist")
		}
		productAsset := Product{}
		err = json.Unmarshal(productAssetAsBytes, &productAsset)
		if err != nil { return shim.Error(err.Error()) }
		productArray = append(productArray, productAsset)

	}
	productArrayJSONasBytes, _ := json.Marshal(productArray)
	return shim.Success(productArrayJSONasBytes)
}



func queryProductCollectionBytes(stub shim.ChaincodeStubInterface, collectionType string, collectionID string) []byte {
	var keyName string
	if( collectionType == "transport" ) {
		keyName = "Transport~Product"
	} else if( collectionType == "custodian" ) {
		keyName = "Custodian~Product"
	} else if( collectionType == "shipment" ) {
		keyName = "Shipment~Product"
	} else if( collectionType == "po" ) {
		keyName = "PO~Product"
	} else {
		keyName = "Shipment~Product"
	}

	productIterator, err := stub.GetStateByPartialCompositeKey(keyName, []string{collectionID})
	if err != nil { return []byte{0x00} }
	defer productIterator.Close()

	var productArray []Product
	//var i int
	//for i = 0; productIterator.HasNext(); i++ {
	for productIterator.HasNext() {
		item, err := productIterator.Next()
		if err != nil { return []byte{0x00} }

		_, keyComposite, err := stub.SplitCompositeKey(item.Key)
		if err != nil {	return []byte{0x00} }
		sn := keyComposite[1]

		productAssetAsBytes, err := stub.GetState(sn)
		if err != nil {
			return []byte{0x00}
		} else if productAssetAsBytes == nil {
			return []byte{0x00}
		}
		productAsset := Product{}
		err = json.Unmarshal(productAssetAsBytes, &productAsset)
		if err != nil { return []byte{0x00} }
		productArray = append(productArray, productAsset)

	}
	productArrayJSONasBytes, _ := json.Marshal(productArray)
	return productArrayJSONasBytes
}




func (s *SmartContract) getHistoryForProduct(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 1 { return shim.Error("Incorrect number of arguments. Expecting 1") }

	assetKey := args[0]

	fmt.Printf("- start getHistoryForProduct: %s\n", assetKey)

	txnIterator, err := stub.GetHistoryForKey(assetKey)
	if err != nil { return shim.Error(err.Error()) }
	defer txnIterator.Close()

	var txnArray []Product
	//var i int
	//for i = 0; txnIterator.HasNext(); i++ {
	for txnIterator.HasNext() {
		txn, err := txnIterator.Next()
		if err != nil { return shim.Error(err.Error()) }

		//txnValue := Product{}
		//txnValue := txn.Value
		//txnValue.txnId = txn.TxId
		//txnValue.timestamp = time.Unix(txn.Timestamp.Seconds, int64(txn.Timestamp.Nanos)).String()
		//txnArray = append(txnArray, txnValue)

		txnValue := txn.Value
		txnAsset := Product{}
		err = json.Unmarshal(txnValue, &txnAsset)
		if err != nil { return shim.Error(err.Error()) }
		txnAsset.TxnId = txn.TxId
		txnAsset.Timestamp = time.Unix(txn.Timestamp.Seconds, int64(txn.Timestamp.Nanos)).Format(time.RFC3339)
		//txnAsset.Timestamp = time.Unix(txn.Timestamp.Seconds, int64(txn.Timestamp.Nanos)).String()
		txnArray = append(txnArray, txnAsset)

	}
	txnArrayJSONasBytes, _ := json.Marshal(txnArray)
	return shim.Success(txnArrayJSONasBytes)
}


//////////////////////////////////////////////////////////////
//  PO METHODS
//////////////////////////////////////////////////////////////

func (s *SmartContract) createPO(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) < 8 { return shim.Error("Incorrect number of arguments. Expecting 8") }

	po := args[0]
	poDate := args[1]
	buyerID := args[2]
	supplierID := args[3]
	details := args[4]
	acceptSign := args[5]
	acceptDate := args[6]
	deliveryDate := args[7]
	deliveryLocation := "Madrid"
	if( len(args) >= 9 && args[8] != "" ) { deliveryLocation = args[8] }
	status := "open"

	ts, errTs := stub.GetTxTimestamp()
	tss := ""
	if errTs == nil {	tss = time.Unix(ts.Seconds, int64(ts.Nanos)).Format(time.RFC3339) }

	if( acceptDate == "" ) { acceptDate = tss }
	if( deliveryDate == "" ) { deliveryDate = tss }

	var poAsset = PO{PO: po, PODate: poDate, BuyerID: buyerID, SupplierID: supplierID, Details: details, AcceptSign: acceptSign, AcceptDate: acceptDate, DeliveryDate: deliveryDate, DeliveryLocation: deliveryLocation, Status: status}
	poAssetAsBytes, _ := json.Marshal(poAsset)

	err := stub.PutState("PO."+po, poAssetAsBytes)
	if err != nil { return shim.Error(fmt.Sprintf("Failed to create PO : %s", po)) }

	if err == nil {
		value := []byte{0x00}
		indexKey, err := stub.CreateCompositeKey("PO~Buyer~Status~PO", []string{"PO", poAsset.BuyerID, "open", poAsset.PO})
		if err == nil { stub.PutState(indexKey, value) }
		indexKey2, err := stub.CreateCompositeKey("PO~Supplier~Status~PO", []string{"PO", poAsset.SupplierID, "open", poAsset.PO})
		if err == nil { stub.PutState(indexKey2, value) }
	}
	return shim.Success(nil)
}


func (s *SmartContract) closePO(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 1 { return shim.Error("Incorrect number of arguments.  Expecting 1: <po>") }
	po := args[0]
	status := "closed"

	ts, errTs := stub.GetTxTimestamp()
	tss := ""
	if errTs == nil {	tss = time.Unix(ts.Seconds, int64(ts.Nanos)).Format(time.RFC3339) }

	response := s.updatePO(stub, po, status, "", tss)
	if response.Status != shim.OK { return shim.Error("Update PO failed: " + response.Message) }

	return shim.Success(nil)
}


func (s *SmartContract) cancelPO(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 1 { return shim.Error("Incorrect number of arguments.  Expecting 1: <po>") }
	po := args[0]
	status := "cancelled"

	ts, errTs := stub.GetTxTimestamp()
	tss := ""
	if errTs == nil {	tss = time.Unix(ts.Seconds, int64(ts.Nanos)).Format(time.RFC3339) }

	response := s.updatePO(stub, po, status, "", tss)
	if response.Status != shim.OK { return shim.Error("Update PO failed: " + response.Message) }

	return shim.Success(nil)
}


func (s *SmartContract) updatePOWithShipment(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 3 { return shim.Error("Incorrect number of arguments.  Expecting 3: <po> <shipment> <estDelivery>") }
	po := args[0]
	shipment := args[1]
	deliveryDate := args[2]

	response := s.updatePO(stub, po, "", shipment, deliveryDate)
	if response.Status != shim.OK { return shim.Error("Update PO failed: " + response.Message) }

	return shim.Success(nil)
}


func (s *SmartContract) updatePO(stub shim.ChaincodeStubInterface, po string, status string, shipment string, deliveryDate string) sc.Response {

	poAssetAsBytes, _ := stub.GetState("PO." + po)
	if poAssetAsBytes == nil { return shim.Error("Could not locate PO ")	}
	poAsset := PO{}
	json.Unmarshal(poAssetAsBytes, &poAsset)

	oldStatus := poAsset.Status
	//oldShipment := poAsset.Shipment
	//oldDeliveryDate := poAsset.DeliveryDate

	if( shipment != "" ) { poAsset.Shipment = shipment; }
	if( deliveryDate != "" ) { poAsset.DeliveryDate = deliveryDate; }
	if( status != "" ) { poAsset.Status = status }

	poAssetAsBytes, _ = json.Marshal(poAsset)
	err := stub.PutState("PO." + po, poAssetAsBytes)
	if err != nil { return shim.Error(fmt.Sprintf("Failed to update PO: %s", po)) }

	if( status != "" && err == nil ) {
		value := []byte{0x00}
		indexKey, err := stub.CreateCompositeKey("PO~Buyer~Status~PO", []string{"PO", poAsset.BuyerID, poAsset.Status, poAsset.PO })
		if err == nil { stub.PutState(indexKey, value) }
		indexKey2, err := stub.CreateCompositeKey("PO~Buyer~Status~PO", []string{"PO", poAsset.BuyerID, oldStatus, poAsset.PO})
		if err == nil { stub.DelState(indexKey2) }
		indexKey3, err := stub.CreateCompositeKey("PO~Supplier~Status~PO", []string{"PO", poAsset.SupplierID, poAsset.Status, poAsset.PO })
		if err == nil { stub.PutState(indexKey3, value) }
		indexKey4, err := stub.CreateCompositeKey("PO~Supplier~Status~PO", []string{"PO", poAsset.SupplierID, oldStatus, poAsset.PO})
		if err == nil { stub.DelState(indexKey4) }
	}

	return shim.Success(nil)
}




func (s *SmartContract) queryPO(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 1 { return shim.Error("Incorrect number of arguments. Expecting 1: <po>") }
	po := args[0]

	ttAssetAsBytes, _ := stub.GetState("PO." + po)
	if ttAssetAsBytes == nil { return shim.Error("Could not locate PO ")	}

	return shim.Success(ttAssetAsBytes)
}



func (s *SmartContract) queryPOByBuyer(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) < 1 { return shim.Error("Incorrect number of arguments. Expecting 1/2: <buyerID> <statusFilter>") }
	buyerID := args[0]
	statusFilter := "all"
	if( len(args) >= 2 ) { statusFilter = args[1] }
	col :=  queryPOCollectionBytes(stub, "buyer", buyerID, statusFilter )
	if( col != nil ) {
		return shim.Success(col)
	} else {
		return shim.Error("Error getting POs")
	}
}


func (s *SmartContract) queryPOBySupplier(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) < 1 { return shim.Error("Incorrect number of arguments. Expecting 1/2: <supplierID> <statusFilter>") }
	supplierID := args[0]
	statusFilter := "all"
	if( len(args) >= 2 ) { statusFilter = args[1] }
	col :=  queryPOCollectionBytes(stub, "supplier", supplierID, statusFilter)
	if( col != nil ) {
		return shim.Success(col)
	} else {
		return shim.Error("Error getting POs")
	}
}


func queryPOCollectionBytes(stub shim.ChaincodeStubInterface, collectionType string, collectionID string, statusFilter string) []byte {
	var keyName string
	if( collectionType == "buyer" ) {
		keyName = "PO~Buyer~Status~PO"
	} else if( collectionType == "supplier" ) {
		keyName = "PO~Supplier~Status~PO"
	} else {
		keyName = "PO~Buyer~Status~PO"
	}
	keyValues := make([]string, 2)
	keyValues[0] = "PO"
	keyValues[1] = collectionID
	if( statusFilter != "all" ) {
		keyValues = append( keyValues, statusFilter )
	}

	poIterator, err := stub.GetStateByPartialCompositeKey(keyName, keyValues)
	if err != nil { return []byte{0x00} }
	defer poIterator.Close()

	var poArray []PO
	for poIterator.HasNext() {
		item, err := poIterator.Next()
		if err != nil { return []byte{0x00} }

		_, keyComposite, err := stub.SplitCompositeKey(item.Key)
		if err != nil {	return []byte{0x00} }
		po := keyComposite[3]

		poAssetAsBytes, err := stub.GetState("PO." + po)
		if err != nil {
			return []byte{0x00}
		} else if poAssetAsBytes == nil {
			return []byte{0x00}
		}
		poAsset := PO{}
		err = json.Unmarshal(poAssetAsBytes, &poAsset)
		if err != nil { return []byte{0x00} }
		poArray = append(poArray, poAsset)

	}
	poArrayJSONasBytes, _ := json.Marshal(poArray)
	return poArrayJSONasBytes
}


func (s *SmartContract) queryAllPOs(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	startKey := ""
	endKey := ""
	resultsIterator, err := stub.GetStateByRange(startKey, endKey)

	if err != nil { return shim.Error(err.Error()) }
	defer resultsIterator.Close()

	var poArray []PO
	//var i int
	//for i = 0; resultsIterator.HasNext(); i++ {
	for resultsIterator.HasNext() {
		item, err := resultsIterator.Next()
		if err != nil { return shim.Error(err.Error()) }

		if !(strings.HasPrefix(string(item.Key), "PO.")) { continue }

		poAssetAsBytes, err := stub.GetState(item.Key)
		if err != nil {
			return shim.Error("Failed to get PO:" + err.Error())
		} else if poAssetAsBytes == nil {
			return shim.Error("PO does not exist")
		}
		poAsset := PO{}
		err = json.Unmarshal(poAssetAsBytes, &poAsset)
		if err != nil { return shim.Error(err.Error()) }
		poArray = append(poArray, poAsset)

	}
	poArrayJSONasBytes, _ := json.Marshal(poArray)
	return shim.Success(poArrayJSONasBytes)
}

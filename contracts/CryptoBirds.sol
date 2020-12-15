// contracts/CryptoBirds.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Stoppable.sol";

contract CryptoBirds is ERC721, Stoppable {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint[] public generationsPopulation;
    
    struct CryptoBird {
        uint32 gene;
        uint256 birth;
        uint16 generation;
        uint256 price;
    }
    mapping (uint256 => CryptoBird) public birds;

    event NewCryptoBird(uint256 indexed tokenId);
    event CryptoBirdAvailableForSale(uint256 indexed tokenId);

    constructor() ERC721("CryptoBirds", "CBRDS")
    {
        generationsPopulation.push(_calculateGenerationCount(0));
        _unleashGeneration(0, 30);

        uint32 _gene = uint32(uint(keccak256(abi.encodePacked("Genesis", block.number))));
        for (uint i = 0; i < 30; i++) {
            uint256 _newCryptoBirdTokenId = _mintNewCryptoBird(
                address(this),
                _gene,
                block.number,
                0,
                _calculateBasePriceByGeneration(0)
            );
            emit CryptoBirdAvailableForSale(_newCryptoBirdTokenId);
            _gene = uint32(uint(keccak256(abi.encodePacked(_gene))));
        }
    }

    function _mintNewCryptoBird(address _owner, uint32 _gene, uint256 _birth, uint16 _generation, uint256 _price)
    internal stoppable returns (uint256)
    {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(_owner, newTokenId);

        CryptoBird memory _newCryptoBird = CryptoBird({
            gene: _gene,
            birth: _birth,
            generation: _generation,
            price: _price
        });
        birds[newTokenId] =_newCryptoBird;

        emit NewCryptoBird(newTokenId);

        return newTokenId;
    }

    function buy(uint256 _tokenId)
    public payable stoppable
    {
        require(_tokenId <= _tokenIds.current(), "tokenId does not exist");

        address _currentOwner = ownerOf(_tokenId);
        require(_currentOwner != msg.sender, "you can't buy your own token!");

        CryptoBird storage _cryptoBird = birds[_tokenId];
        require(_cryptoBird.birth > 0, "bird does not exist");

        uint256 _currentPirce = _cryptoBird.price;
        require(msg.value >= _currentPirce, "minimum price not met");

        _cryptoBird.price = 0;
        _transfer(_currentOwner, msg.sender, _tokenId);

        if (_currentOwner != address(this)) {
            payable(_currentOwner).transfer(_currentPirce);
        }
    }

    function breed(uint256 _firstBirdTokenId, uint256 _secondBirdTokenId)
    public stoppable returns (uint256)
    {
        require(ownerOf(_firstBirdTokenId) == msg.sender, "you should own both tokens");
        require(ownerOf(_secondBirdTokenId) == msg.sender, "you should own both tokens");

        CryptoBird memory _firstBird = birds[_firstBirdTokenId];
        CryptoBird memory _secondBird = birds[_secondBirdTokenId];

        uint16 _maxGeneration = uint16(Math.max(_firstBird.generation, _secondBird.generation));
        uint16 _newGeneration = _maxGeneration + 1;
        require(_newGeneration > _maxGeneration, "no new generation possible");

        require(_unleashGeneration(_newGeneration, 2), "no more from this generation");

        uint32 _firstGene;
        uint32 _secondGene;
        (_firstGene, _secondGene) = _offspringGenes(_firstBird.gene, _secondBird.gene);

        uint256 _newCryptoBirdTokenId = _mintNewCryptoBird(
            address(this),
            _firstGene,
            block.number,
            _newGeneration,
            _calculateBasePriceByGeneration(_newGeneration)
        );
        emit CryptoBirdAvailableForSale(_newCryptoBirdTokenId);

        return _mintNewCryptoBird(
            msg.sender,
            _secondGene,
            block.number,
            _newGeneration,
            0
        );
    }

    function _offspringGenes(uint32 _firstGene, uint32 _secondGene)
    internal view returns (uint32, uint32)
    {
        uint32 _firstGeneFirstHalf = uint32(_firstGene >> 16);
        uint32 _firstGeneSecondHalf = uint32(_firstGene << 16);
        uint32 _secondGeneFirstHalf = uint32(_secondGene >> 16);
        uint32 _secondGeneSecondHalf = uint32(_secondGene << 16);

        uint32 _firstOffspring = _firstGeneFirstHalf + _secondGeneSecondHalf;
        uint32 _secondOffspring = _firstGeneSecondHalf + _secondGeneFirstHalf;

        for (uint256 i = 0; i < 16; i++) {
            uint32 mutation = 1;
            mutation = mutation << uint32((block.timestamp >> i) % 32);
            _firstOffspring = _firstOffspring ^ mutation;
            _secondOffspring = _secondOffspring ^ mutation;
        }

        return (_firstOffspring, _secondOffspring);
    }

    function _calculateGenerationCount(uint16 _generation)
    internal pure returns (uint)
    {
        uint indicator = _generation % 6;
        if (indicator == 0) {
            return 30;
        }

        return 30 * (12 - (indicator * 2));
    }

    function _canGenerate(uint16 _generation, uint _count)
    internal returns (bool)
    {
        if (_generation > generationsPopulation.length - 1) {
            generationsPopulation.push(_calculateGenerationCount(_generation));
        }
        
        return (generationsPopulation[_generation] >= _count);
    }

    function _unleashGeneration(uint16 _generation, uint _count)
    internal returns (bool)
    {
        if (_canGenerate(_generation, _count)) {
            generationsPopulation[_generation] -= _count;
            return true;
        }
        return false;
    }

    function _calculateBasePriceByGeneration(uint16 _generation) 
    internal pure returns (uint256)
    {
        uint256 finalPrice = 0;
        uint256 basePrice = 0.005 ether;
        uint indicator = _generation % 6;
        if (indicator == 0) {
            finalPrice += basePrice;
        } else {
            finalPrice += basePrice / (12 - (indicator * 2));
        }
        finalPrice += 0.00001 ether * _generation;
        return finalPrice;
    }

    function _transfer(address from, address to, uint256 tokenId)
    override internal stoppable
    {
        CryptoBird memory _bird = birds[tokenId];
        require(_bird.price == 0, "bird can't be for sale");
        super._transfer(from, to, tokenId);
    }

    function setForSale(uint256 _tokenId, uint256 _price)
    public stoppable
    {
        require(_tokenId <= _tokenIds.current(), "tokenId does not exist");
        require(ownerOf(_tokenId) == msg.sender, "you should own the token");
        require(_price > 0, "price should be greater than zero");

        CryptoBird storage _cryptoBird = birds[_tokenId];
        _cryptoBird.price = _price;

        emit CryptoBirdAvailableForSale(_tokenId);
    }

    

    function redeemAllBalance(address payable _desiredAddress)
    external onlyOwner
    {
        _desiredAddress.transfer(address(this).balance);
    }
}
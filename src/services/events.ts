import { PrismaClient, Prisma } from "@prisma/client";
import * as people from './people';
import * as groups from './groups';
import { encryptMatch } from '../utils/match';

const prisma = new PrismaClient();

export const getAll = async () => {
    try {
        return await prisma.event.findMany();
    } catch (err) {
        return false;
    }
};

export const getOne = async (id: number) => {
    try {
        return await prisma.event.findFirst({ where: { id } });
    } catch (err) {
        return false;
    }
};
type EventsCreateData = Prisma.Args<typeof prisma.event, 'create'>['data'];

export const add = async (data: EventsCreateData) => {
    try {
        return await prisma.event.create({ data });
    } catch (err) {
        return false;
    }
};


type EventsUpdateData = Prisma.Args<typeof prisma.event, 'update'>['data'];
export const update = async (id: number, data: EventsUpdateData) => {
    try {
        return await prisma.event.update({ where: { id }, data });
    } catch (err) {
        return false;
    }
};

export const deleteEvent = async (id: number) => {
    try {
        return await prisma.event.delete({ where: { id } });
    } catch (err) {
        return false;
    }
};

export const doMatches = async (id: number): Promise<boolean> => {
    /*
    id_event: 1
    GRUPO A:(id:5)    GRUPO B:(id:6)   GRUPO C:(id:3)
       - niko         - alastor       - jon
       - anny         - johnny
       - eithor
    */
    const eventItem = await prisma.event.findFirst({ where: { id }, select: { grouped: true } });

    if (eventItem) {
        const peopleList = await people.getAll({ id_event: id });
        if (peopleList) {
            let sortedList: { id: number, match: number }[] = [];
            let sortable: number[] = [];

            let attempts = 0;
            let maxAttempts = peopleList.length;
            let keepTrying = true;
            while (keepTrying && attempts < maxAttempts) {
                keepTrying = false;
                attempts++;
                sortedList = [];
                sortable = peopleList.map(item => item.id);

                for (let i in peopleList) {
                    let sortableFiltered: number[] = sortable;
                    if (eventItem.grouped) {
                        //basicamente: Cria uma lista filtrada.
                        //aonde pega cada um dos ids (de todo mundo) no filter.
                        //ai busca o id da vez no people list pra ele retornar o id_group e os outros dados
                        //então retorna o item id do sortable pro sortableFiltered 
                        //caso o  id não seja do mesmo grupo da pessoa que está sendo analisada no for
                        sortableFiltered = sortable.filter(sortableItem => {
                            let sortabledPerson = peopleList.find(item => item.id === sortableItem);
                            return peopleList[i].id_group !== sortabledPerson?.id_group;
                        });
                    }

                    //se entrar nesse if, deve continuar tentando pq a lista ou tá vazia ou só tem a pessoa da vez nela, e a pessoa n pode tirar ela mesma
                    if (sortableFiltered.length === 0 || (sortableFiltered.length === 1 && peopleList[i].id === sortableFiltered[0])) {
                        keepTrying = true;
                    } else {
                        //aqui, é garantido que a lista tem pelo menos a pessoa da vez e outra pessoa, então
                        //esse bloco de código tentará até conseguir que a pessoa da vez tire a outra ou as outras
                        let sortedIndex = Math.floor(Math.random() * sortableFiltered.length);
                        while (sortableFiltered[sortedIndex] === peopleList[i].id) {
                            sortedIndex = Math.floor(Math.random() * sortableFiltered.length);
                        }

                        //incrementa o resultado final na lista final
                        sortedList.push({
                            id: peopleList[i].id,
                            match: sortableFiltered[sortedIndex]
                        });
                        //remove da lista dos sorteaveis quem acabou de ser sorteado e não pode ser tirado de novo, evitando erros
                        sortable = sortable.filter(item => item !== sortableFiltered[sortedIndex]);
                    }
                }
            }

            console.log(`ATTEMPS: ${attempts}`);
            console.log(`MAX ATTEMPS: ${maxAttempts}`);
            console.log(sortedList);

            //se chegou até aqui e entrou no if, significa que não houve erros
            if (attempts < maxAttempts) {
                //entra nesse for para gravar no banco de dados cada um dos sorteados
                for (let i in sortedList) {
                    await people.update({
                        id: sortedList[i].id,
                        id_event: id
                    }, { matched: encryptMatch(sortedList[i].match) });
                }
                return true;
            }
        }
    }

    return false; //temporario
};